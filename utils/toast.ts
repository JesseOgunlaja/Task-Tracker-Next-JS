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