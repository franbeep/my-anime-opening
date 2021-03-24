import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Header, Icon, Segment, Button } from "semantic-ui-react";

function DragFilesZone({ callback }) {
  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();

      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        // Do whatever you want with the file contents
        console.log("HUAHUSHUAS");
        callback(reader.result);
      };

      reader.readAsArrayBuffer(file);
    });
  }, []);
  // const { getRootProps, getInputProps } = useDropzone({ onDrop });

  // const onDrop = useCallback((acceptedFiles) => {
  //   // Do something with the files
  //   conso
  // }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: "text/xml",
  });

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

      {/* <Button primary>Select File</Button> */}
    </Segment>
  );
}

export default DragFilesZone;
