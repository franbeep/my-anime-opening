import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Header, Icon, Segment, Button } from "semantic-ui-react";

function DragFilesZone({ callback }) {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.warn("File reading was aborted");
      reader.onerror = () => console.error("File reading has failed");
      reader.onload = () => {
        callback(reader.result);
      };

      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
  });

  // TODO: whole Segment as a dropzone

  return (
    <Segment placeholder>
      <div {...getRootProps()} style={{ height: "100%" }}>
        <Header icon>
          <Icon name="code file outline" />
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the file here ...</p>
          ) : (
            <p>Drop the XML export here or click to select the file</p>
          )}
        </Header>
      </div>
    </Segment>
  );
}

export default DragFilesZone;
