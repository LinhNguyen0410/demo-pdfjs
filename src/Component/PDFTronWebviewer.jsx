import React, { useState, useEffect, useRef } from 'react';

export default function PDFTronWebviewer() {
    const [thumb, setThumb] = useState(null)
    const [totalPage, setTotalePage] = useState()
    const [listArray, setListArray] = useState([])
    const [doc, setDoc] = useState()
    const [blobFile, setBlobFile] = useState()

    const inputElement = useRef();
    let array = []

    useEffect(() => {
        inputElement.current.addEventListener("change", (e) => {
            const file = e.target.files[0];
            getBlobFromFile(file);
        });
    }, []);
    const CoreControls = window.CoreControls
    useEffect(() => {
        if (!blobFile) return
        const getThumb = async () => {
            CoreControls.setWorkerPath('/webviewer/lib/corejs');
            const doc = await CoreControls.createDocument(blobFile, { extension: 'pdf' })
            const totalPage = doc.getPageCount()
            setThumb(setTotalePage)
            let array = [];
            // get List Canvas
            for (let i = 1; i <= totalPage; i++) {
                doc.loadCanvasAsync({
                    pageNumber: i,
                    drawComplete: (thumbnail, page) => {
                        array.push(thumbnail)
                        setThumb(thumbnail)
                        console.log(thumbnail);
                    }
                })

            }
            // get List Thumbnail
            for (let i = 1; i <= totalPage; i++) {
                doc.loadThumbnailAsync(i, (thumbnail) => {
                    array.push(thumbnail)
                    setThumb(thumbnail)
                    console.log(thumbnail);
                })

            }
            console.log(array)
            setListArray(array)
        }

        getThumb()
    }, [blobFile]);

    const handleClick = () => {
        CoreControls.DocumentViewer.setCurrentPage(3)
    }

    

    const getBlobFromFile = (file) => {
        if (file) {
            console.log('file', file);
            const reader = new FileReader();

            reader.readAsDataURL(file);
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
                const blob = new Blob([documentBlob], { type: "application/pdf" });
                setBlobFile(documentBlob)
            };
        }
    };
    return (
        <>
            <input type="file" name="file" ref={inputElement} />
            {/* <img src={thumb && thumb.toDataURL()} alt="thumbnail" width='200px' height='200px' /> */}
            {listArray.map((thumb, index) => <img key={index} src={thumb && thumb.toDataURL()} alt="thumbnail" width='700px' height='700px' />)}
            <button onClick={handleClick}> page </button>
        </>
    )
}
