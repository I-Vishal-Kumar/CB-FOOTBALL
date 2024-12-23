import axios from "axios";
import React, { useRef, useState } from "react";
import { MdOutlineUploadFile } from "react-icons/md";

const UploadComponent = ({setUploaded}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  
  const handleUpload = async (file) => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setUploading(true);

    try {
      // Get authentication parameters from the backend
      const res = await (await fetch(`/api/imageKitAuth?tmsmt=${Date.now()}`)).json();

      // Create a form data object
      const formData = new FormData();
      formData.append("file", file);
      formData.append("publicKey", "public_vqtKMKdE65ozlbDD5YOmev2NHuQ=" );
      formData.append("signature", res.signature);
      formData.append("expire", res.expire);
      formData.append("token", res.token);
      formData.append("fileName", file.name.replace(/[^a-zA-Z0-9.]/g, '').replace(/(.*)\.(?=.*\.)/, '$1_'));

      // Upload directly to ImageKit
      const response = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadedImageUrl(response.data.url);
      setUploaded(true);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file. try again or try contact the agent");
    } finally {
      setUploading(false);
    }
  };

  const inputRef = useRef(null);

  return (
    <>
    <h5 className="text-red-400 py-2 mt-3" >Upload the screenshort of the payment</h5>
    <div className="flex flex-col items-center justify-center p-[2px] bg-blue-500 rounded-lg mt-2 pt-1 w-full">
      <p className="text-white text-[0.8rem] font-bold py-2">UPLOAD PAYMENT SCREENSHOT</p>
      <div className="flex items-center justify-between bg-white rounded-md w-full p-1 px-2">
        <div
          onClick={()=>{
            if(inputRef && !uploadedImageUrl && !uploading){
              inputRef.current.click();
            }
          }} 
          className="flex-[1] text-2xl aspect-square bg-blue-500 rounded-md flex justify-center items-center text-white ">
          <MdOutlineUploadFile/>
          <input ref={inputRef} className="hidden" type="file" onChange={(e)=>handleUpload(e.target.files[0])} />
        </div>
        <div className="flex-[6] flex justify-center">
          {
            !uploadedImageUrl ? (
              <p>
                {uploading ? "Uploading..." : "Select a file to see preview"}</p>
            ):(
              <img style={{maxHeight: '5rem'}} height={5} width={"50%"} src={uploadedImageUrl} alt="uploaded file"/>
            )
          }
        </div>
      </div>
  </div>
  </>

  )

};

export default UploadComponent;
