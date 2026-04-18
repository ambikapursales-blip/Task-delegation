import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

function Alert({ className, ...props }) {
  return (
    <div
      className={
        "relative w-full rounded-lg border border-alert/50 bg-alert/5 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-alert " +
        (className || "")
      }
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }) {
  return (
    <h5
      className={
        "mb-1 font-medium leading-tight [&_p]:inline " + (className || "")
      }
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }) {
  return (
    <div
      className={"text-sm [&_p]:leading-relaxed " + (className || "")}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
