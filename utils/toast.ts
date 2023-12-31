import { ToastOptions, toast } from "react-toastify";

type ToastType = "error" | "success";

export const showToast = (
  text: string,
  type: ToastType,
  options?: Partial<ToastOptions>
) => {
  const toastFn = type === "error" ? toast.error : toast.success;

  const toastOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  };

  toastFn(text, {
    ...toastOptions,
    ...options,
  });
};

export const errorToast = (text: string, time?: number) => {
  if (text != undefined && text != null && text !== "") {
    toast.error(text, {
      position: "top-right",
      autoClose: time || 2500,
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

type toastOptions =
  | {
      render: (data: any) => string;
    }
  | string;

type MessageType = {
  success: toastOptions;
  error?: toastOptions;
};

export async function promiseToast(
  fetchUrl: RequestInfo,
  fetchOptions: RequestInit,
  message: MessageType,
  successFunction?: Function
) {
  let success: Boolean = true;
  let data: any;
  const fetchRequest = new Promise((resolve, reject) => {
    fetch(fetchUrl, fetchOptions).then(async (response: Response) => {
      data = await response.json();
      if (response.ok) {
        resolve(data);
      } else {
        success = false;
        reject(data);
      }
    });
  });
  await toast.promise(fetchRequest, {
    pending: "Loading",
    success: message.success,
    error: message.error || "Error. Please try again",
  });
  if (success === true && successFunction) {
    successFunction(data);
  }
}
