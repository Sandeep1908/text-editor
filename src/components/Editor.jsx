import React, { useEffect } from "react";
import "../App.css";

import {
  Editor,
  EditorState,
  RichUtils,
  Modifier,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { Box, Button, Flex, Text } from "@chakra-ui/react";

import { useToast } from "@chakra-ui/react";

// Look and feel of the editor
const editorStyle = {
  
  borderRadius: "10px",
  cursor: "text",
  width: "70%",
  height: "25rem",
  margin: "auto",
  padding: "1rem",
  marginTop: "2rem",
  backgroundColor: "white",
  boxShadow:'1px 1px 1px 1px'
};

const styleMap = {
  RED: {
    color: "red",
  },
  UNDERLINE: {
    textDecoration: "underline",
  },
  header: {
    fontSize: "2.5em",
    fontWeight: "bold",
  },
  BOLD: {
    fontWeight: "bold",
  },
};

function blockStyleFn(contentBlock) {
  const type = contentBlock.getType();
  if (type === "header-one") {
    return "header";
  }
  return null;
}

export default function TextEditor() {
  const toast = useToast();

  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const [activeStyle, setActiveStyle] = React.useState(null);

  const editor = React.useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  function handleChange(newEditorState) {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
    const block = contentState.getBlockForKey(selectionState.getStartKey());
    const text = block.getText();

    if (text.startsWith("* ")) {
      // Apply bold style to line
      setActiveStyle("BOLD");
    } else if (text.startsWith("** ")) {
      // Apply red color to line
      setActiveStyle("RED");
    } else if (text.startsWith("*** ")) {
      // Apply underline to line
      setActiveStyle("UNDERLINE");

    } 
    
    
    else if (text.startsWith("# ")) {
  
      // Apply header-one block type
      setActiveStyle('header');
      newEditorState = RichUtils.toggleBlockType(newEditorState, "header");
      newEditorState = removeTriggerCharacter(
        newEditorState,
        text.substring(0, 2)
      );
      setEditorState(newEditorState);
      return;
    } else {
      setActiveStyle(null);
    }

    // Move this check after the header block type check
    if (activeStyle) {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, activeStyle);
    }

    if (
      text.startsWith("* ") ||
      text.startsWith("** ") ||
      text.startsWith("*** ") ||
      text.startsWith("# ")
    ) {
      newEditorState = removeTriggerCharacter(
        newEditorState,
        text.substring(0, 3)
      );
    }

    setEditorState(newEditorState);
  }

  function removeTriggerCharacter(newEditorState, trigger) {
    const contentState = newEditorState.getCurrentContent();
    const selectionState = newEditorState.getSelection();
     

    let newContentState = Modifier.replaceText(
      contentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: trigger.length,
      }),
      " "
    );

    newEditorState = EditorState.push(
      newEditorState,
      newContentState,
      "remove-range"
    );

    newContentState = Modifier.removeRange(
      newContentState,
      selectionState.merge({
        anchorOffset: 0,
        focusOffset: 1,
      }),
      "backward"
    );

    return EditorState.push(newEditorState, newContentState, "remove-range");
  }

  // Function for saving the content into localStorage
  function saveContent() {
    const contentState = editorState.getCurrentContent();
    const contentString = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("savedEditorContent", contentString);

    toast({
      title: "Save Successful",
      description: "Your text have been saved successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  }

  // Load content from local storage
  useEffect(() => {
    const savedContent = localStorage.getItem("savedEditorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  return (
    <>
      {/* Header Section */}

      <Flex
        className=""
        align="center"
        justify="center"
        gap="10rem"
        padding="0.5rem 0"
      >
        
        <Text fontSize='4xl'>TEXT EDITOR</Text>
  
      </Flex>
   
      <Box className="editor__box" style={editorStyle} onClick={focusEditor}>
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={handleChange}
          placeholder="Write something!"
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
        />
      </Box>

      <Flex
        className="header__main"
        align="center"
        justify="center"
        gap="10rem"
        padding="0.5rem 0"
      >
        
        <Button size="md" colorScheme="blue" onClick={saveContent}>
          Save
        </Button>
      </Flex>
    </>
  );
}
