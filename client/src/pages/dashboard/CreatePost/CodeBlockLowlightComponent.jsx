import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import PropTypes from "prop-types";

export default function CodeBlockLowlightComponent(props) {
  const {
    node: {
      attrs: { language: defaultLanguage },
    },
    updateAttributes,
    extension,
    editor: {
      view: { editable },
    },
  } = props;
  return (
    <NodeViewWrapper className="code-block">
      <select
        contentEditable={false}
        disabled={!editable}
        defaultValue={defaultLanguage}
        onChange={(event) => {
          updateAttributes({ language: event.target.value });
        }}
      >
        <option
          className="dark:text-gray-200 dark:bg-[rgb(23,30,48)]"
          value="null"
        >
          auto
        </option>
        {extension.options.lowlight.listLanguages().map((lang, index) => (
          <option
            className="dark:text-gray-200 dark:bg-[rgb(23,30,48)]"
            key={index}
            value={lang}
          >
            {lang}
          </option>
        ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
CodeBlockLowlightComponent.propTypes = {
  node: PropTypes.object.isRequired,
  updateAttributes: PropTypes.func.isRequired,
  extension: PropTypes.object.isRequired,
  editor: PropTypes.object,
};
