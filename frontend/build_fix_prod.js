const fs = require("fs");
const path = require("path");

const styles = path.resolve(__dirname, "build", "static", "css", "main.css")

let content = fs.readFileSync(styles, "utf8");
content = content.replaceAll("/wordpress/plugins", "/wp-content/plugins");

fs.writeFileSync(styles, content);
