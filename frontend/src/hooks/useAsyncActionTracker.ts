import React from "react";

const getErrorMessageFromApiResponse = (_errResponse: Response): string => {
  return "oops";
};

export type AsyncAction<ParameterType, ReturnType = void> = ParameterType extends void
  ? () => Promise<ReturnType>
  : (params: ParameterType) => Promise<ReturnType>;

/**
 *
 * @param action
 * @param initialState
 * @param supressLoadingIndicator use for polling action where each polling should not trigger UI to show loading status but rather should kept previous data
 */
export const useAsyncActionTracker = <ReturnType, ParameterType = void>(
  action: AsyncAction<ParameterType, ReturnType>,
  initialState?: ReturnType,
  supressLoadingIndicator = false,
  initialLoadingState = false,
  delay = 0
) => {
  const [isLoading, setIsLoading] = React.useState(initialLoadingState);
  const [error, setError] = React.useState<string>();
  const [data, setData] = React.useState<ReturnType | undefined>(initialState);

  const setStateToLoading = () => {
    // in case previous action call ended with error, we want to show isLoading to provide feedback to user
    if (!supressLoadingIndicator || error) {
      setIsLoading(true);
      setError(undefined);
      setData(undefined);
    }
  };

  const setStateToSucceeded = (result: ReturnType) => {
    setData(result);
    setIsLoading(false);
    setError(undefined);
  };

  const setStateToError = async (err: Error | Response) => {
    setIsLoading(false);
    if (err instanceof Response) {
      setError(getErrorMessageFromApiResponse(err));
    } else {
      setError(err.message);
    }

    setData(undefined);
  };

  const execute = async (parameter: ParameterType): Promise<ReturnType | undefined> => {
    try {
      setStateToLoading();
      if (delay > 0) {
        await new Promise((r) => {
          window.setTimeout(r, delay);
        });
      }
      const preview = await action(parameter);
      setStateToSucceeded(preview);
      return preview;
    } catch (e) {
      await setStateToError(e);
    }

    return undefined;
  };

  const executeWithoutLoadingState = async (parameter: ParameterType): Promise<ReturnType | undefined> => {
    try {
      const preview = await action(parameter);
      setStateToSucceeded(preview);
      return preview;
    } catch (e) {
      await setStateToError(e);
    }

    return undefined;
  };

  return { data, error, isLoading, execute, executeWithoutLoadingState };
};
