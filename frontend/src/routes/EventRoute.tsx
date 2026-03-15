import React from "react";
import { useParams } from "react-router-dom";
import { useFetchEvent } from "../hooks/useFetchEvent";
import { Message } from "primereact/message";
import { errors } from "../messages";
import { createReactEditorJS } from "react-editor-js";
import { EDITOR_JS_TOOLS } from "../editorTools";
import { EditorCore } from "../types";
import { EventHeader } from "../components/EventHeader";
import { EventUsers } from "../components/EventUsers";
import { EventRefreshContext } from "../context/EventRefreshContext";
import { Spinner } from "../components/Spinner";

const ReadOnlyEditor: React.FC<{ blocks: string }> = ({ blocks }) => {
  // eslint-disable-next-line no-null/no-null
  const editorCore = React.useRef<EditorCore | null>(null);
  const handleInitialize = React.useCallback((instance: EditorCore) => {
    editorCore.current = instance;
  }, []);
  const ReactEditorJS = createReactEditorJS();

  const parsedBlocks = React.useMemo(() => {
    try {
      return JSON.parse(blocks);
    } catch (e) {
      return [];
    }
  }, [blocks]);

  if (!blocks || parsedBlocks.length === 0) {
    return <></>;
  }

  return (
    <div
      className="eventDescription"
      style={{ maxWidth: "850px" }}
    >
      <ReactEditorJS
        readOnly={true}
        defaultValue={{ blocks: parsedBlocks }}
        onInitialize={handleInitialize}
        // readOnly={true}
        tools={EDITOR_JS_TOOLS}
      />
    </div>
  );
};

export const EventRoute: React.FC<{}> = () => {
  const { id } = useParams();
  const { error, event, isLoading, refresh } = useFetchEvent(parseInt(id || "-1", 10));

  const [refreshKey, setRefreshKey] = React.useState<number>(0);

  React.useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  return (
    <>
      <style>{`.et_pb_section.et_pb_section_1.et_section_regular {
            background: white;
            background-image: none !important;
      }
      `}</style>
      <EventRefreshContext.Provider value={{ refreshKey, setRefreshKey }}>
        {isLoading && !event && <Spinner />}
        {!isLoading && error && (
          <Message
            severity="error"
            text={errors.event}
          />
        )}
        {!error && event && (
          <div className="p-2">
            <React.StrictMode>
              <EventHeader
                isDetailView={true}
                refresh={refresh}
                event={event}
              />
            </React.StrictMode>
            <ReadOnlyEditor blocks={event.description} />
            <React.StrictMode>
              <EventUsers event={event} />
            </React.StrictMode>
          </div>
        )}
      </EventRefreshContext.Provider>
    </>
  );
};
