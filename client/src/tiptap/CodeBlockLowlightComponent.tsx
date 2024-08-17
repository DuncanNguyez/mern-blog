import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";

export default function CodeBlockLowlightComponent(props: Record<string, any>) {
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
    <NodeViewWrapper className="code-block pt-8">
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
          value="auto"
        >
          auto
        </option>
        {extension.options.lowlight
          .listLanguages()
          .map((lang: string, index: number) => (
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
