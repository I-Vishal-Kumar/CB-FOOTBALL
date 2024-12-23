// components/OlarkChat.js
import { useEffect } from "react";

const OlarkChat = () => {
  // useEffect(() => {
  //   if (!document.querySelector("#tidio-chat")) {
  //     const script = document.createElement("script");
  //     script.async = true;
  //     script.src = "//code.tidio.co/vxwslfiqavslfshkzjnnixbjimwewctv.js";
  //     document.body.appendChild(script);
  //   }
  //   return () => {
  //     document.querySelector("#tidio-chat")?.remove();
  //   };
  // }, []);

  // useEffect(() => {
  //   if (!document.querySelector("[data-id='zsalesiq']")) {
  //     let script = document.createElement("script");
  //     script.type = "text/javascript";
  //     script.id = "zsiqchat";
  //     script.innerHTML = `
  //   var $zoho = $zoho || {};
  //   $zoho.salesiq = $zoho.salesiq || {
  //     widgetcode: "siqb5d93c8a76f9d78afd916ace4c80a94e32d5531b5b274816914cbd359cd12ed3",
  //     values: {},
  //     ready: function () {}
  //   };
  // `;
  //     document?.head?.appendChild(script);
  //     var salesiqScript = document.createElement("script");
  //     salesiqScript.type = "text/javascript";
  //     salesiqScript.id = "zsiqscript";
  //     salesiqScript.defer = true;
  //     salesiqScript.src = "https://salesiq.zoho.in/widget";

  //     salesiqScript.addEventListener("load", () => {
  //       setTimeout(() => {
  //         const zSalesIQElement = document.querySelector(
  //           "[data-id='zsalesiq']"
  //         );
  //         if (zSalesIQElement) {
  //           zSalesIQElement.style.bottom = "4.5rem";
  //         }
  //       }, 1500);
  //     });
  //     // Insert the widget script after the dynamically created script
  //     script.parentNode.insertBefore(salesiqScript, script.nextSibling);
  //   }

  //   return () => {
  //     const script1 = document.querySelector("#zsiqchat");
  //     const script2 = document.querySelector("#zsiqscript");
  //     const zSalesIQElement = document.querySelector("[data-id='zsalesiq']");
  //     if (zSalesIQElement) {
  //       zSalesIQElement.remove();
  //     } else if (script1) {
  //       script1.remove();
  //     } else if (script2) {
  //       script2.remove();
  //     }
  //   };
  // }, []);

  return null;
};

export default OlarkChat;
