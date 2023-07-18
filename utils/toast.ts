import { toast } from "react-toastify";

export const errorToast = (text: string) => {
  if (text != undefined && text != null && text !== "") {
    toast.error(text, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

export const successToast = (text: string) => {
  if (text != undefined && text != null && text !== "") {
    toast.success(text, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  }
};

type MessageType = {
  success: string;
  error?: string;
};

export async function promiseToast(
  fetchUrl: RequestInfo,
  fetchOptions: RequestInit,
  message: MessageType,
  successFunction?: Function
) {
  let success
  const fetchRequest = new Promise((resolve, reject) => {
    fetch(fetchUrl, fetchOptions).then(async (response: Response) => {
      if (response.ok) {
        success = true
        resolve("Success");
      } else {
        reject();
      }
    });
  });
  toast.promise(fetchRequest, {
    pending: "Loading",
    success: message.success,
    error: message.error || "Error. Please try again",
  });
  if(success && successFunction) {
    console.log("hi")
    successFunction()
  }
}
