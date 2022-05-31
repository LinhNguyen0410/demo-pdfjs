import React, { useEffect, useState, useRef } from "react";
import "./App.css";
import WebViewer, { getInstance } from "@pdftron/pdfjs-express-viewer";

const App = () => {
  const viewer = useRef();
  const inputElement = useRef();
  const currentPageImage = useRef();
  const [value, setValue] = useState("1");
  const [blobUrl, setBlobUrl] = useState("");
  const zoomLevels = ["25%", "50%", "100%", "150%"];

  const getBlobFromFile = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const byteString = atob(base64.split(",")[1]);
        const uint8Array = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
          uint8Array[i] = byteString.charCodeAt(i);
        }
        const documentBlob = new Blob([uint8Array], {
          type: "application/pdf",
        });
        loadPDF(documentBlob, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const getBlobUrlFromBase64 = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const uint8Array = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: "image/png" });
    return URL.createObjectURL(blob);
  };

  const loadPDF = (documentBlob, file) => {
    WebViewer(
      {
        path: "/webviewer/lib",
        licenseKey: "FP3Mu5FXNL2D1WL7II6Z",
        disableFlattenedAnnotations: true,
        disabledElements: [
          "viewControlsButton",
          "viewControlsOverlay",
          "zoomOverlayButton",
          "panToolButton",
          "selectToolButton",
          "searchButton",
          "menuButton",
          "moreButton",
        ],
      },
      viewer.current
    ).then((instance) => {
      const { Core, UI, docViewer } = instance;
      const LayoutMode = UI.LayoutMode;
      UI.setLayoutMode(LayoutMode.Single);
      // UI.disableElements(["leftPanel", "leftPanelButton"]);

      Core.documentViewer.addEventListener("documentLoaded", () => {
        const getInfo = docViewer.getDocument();
        console.log("getInfo", getInfo.aa.ca);
        // docViewer.setCurrentPage(3);
      });

      Core.documentViewer.addEventListener(
        "pageComplete",
        (pageNumber, canvas) => {
          console.log(canvas);
          const pageHeight = Core.documentViewer.getPageHeight(pageNumber);
          const pageWidth = Core.documentViewer.getPageWidth(pageNumber);
          const base64 = canvas.toDataURL();
          const blobUrl = getBlobUrlFromBase64(base64);
          console.log({
            pageNumber,
            pageHeight,
            pageWidth,
            blobUrl,
          });
          // setBlobUrl(blobUrl);
          currentPageImage.current.src = blobUrl;
        }
      );

      Core.documentViewer.addEventListener(
        "pageNumberUpdated",
        (pageNumber) => {
          const getInfo = docViewer.getDocument().aa.ca;
          const currentPageInfo = getInfo.filter((page) => {
            return page.pageNum === pageNumber;
          });
          console.log(currentPageInfo);
        }
      );

      // load file =>  UI
      UI.loadDocument(documentBlob, { filename: file.name });
      // using file system : UI.loadDocument(file, { filename: file.name });
    });
  };

  useEffect(() => {
    inputElement.current.addEventListener("change", (e) => {
      const file = e.target.files[0];
      getBlobFromFile(file);
    });
  }, []);

  const showCurrentPage = () => {
    const instance = getInstance();
    if (instance) {
      const { Core, docViewer } = instance;
      // go to any page
      Core.documentViewer.setCurrentPage(value);
      // docViewer.setCurrentPage(value);
    }
  };

  const handleZoom = (e) => {
    const instance = getInstance();
    if (instance) {
      instance.setZoomLevel(e.target.value);
    }
  };
  console.log(getInstance());

  return (
    <>
      <div className="App">
        <div className="webviewer" ref={viewer}></div>
        <input type="file" name="file" ref={inputElement} />
      </div>
      <div>
        <input
          type="text"
          name="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={showCurrentPage}>{`Di toi page ${value}`}</button>
        <select defaultValue={"100%"} onChange={handleZoom}>
          {zoomLevels.map((level, idx) => (
            <option value={level} key={idx}>
              {level}
            </option>
          ))}
        </select>
      </div>
      <img src="" ref={currentPageImage} className="image_pdf" />
    </>
  );
};

export default App;
