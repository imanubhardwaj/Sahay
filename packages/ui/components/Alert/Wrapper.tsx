"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { EventMap } from "../../utils/eventBus";
import createEventBus from "../../utils/eventBus";
import Alert, { type Props } from "./index";
import { clsx } from "clsx";
import { v4 as uuid } from "uuid";

export enum AlertVariant {
  SUCCESS = "success",
  INFO = "info",
  ERROR = "error",
  WARNING = "warning",
}

type AlertProps = Omit<Props, "children"> & {
  message: string | ReactNode;
  variant: AlertVariant;
  debug?: boolean;
};

type AlertPropsWId = AlertProps & { id: string };

interface AlertEvents extends EventMap {
  open: (props: AlertPropsWId) => void;
  close: (id: string) => void;
}

const alertEventChannel = createEventBus<AlertEvents>();

export const notify = (props: AlertProps): void => {
  alertEventChannel.emit("open", { ...props, id: uuid() });
};

export default function AlertWrapper({ className }: { className?: string }) {
  const [alerts, setAlerts] = useState<AlertPropsWId[]>([]);

  const handleClose = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const handleOpen = useCallback(
    (options: AlertPropsWId) => {
      const alertWithTimeout = { ...options, timeoutInMs: 3000 };
      setAlerts((prev) => [...prev, alertWithTimeout]);

      // Auto-close after timeout
      if (alertWithTimeout.timeoutInMs) {
        setTimeout(() => {
          handleClose(alertWithTimeout.id);
        }, alertWithTimeout.timeoutInMs);
      }
    },
    [handleClose],
  );

  useEffect(() => {
    const unsubscribeOpen = alertEventChannel.on("open", handleOpen);
    const unsubscribeClose = alertEventChannel.on("close", handleClose);

    return () => {
      unsubscribeOpen();
      unsubscribeClose();
    };
  }, [handleOpen, handleClose]);

  return (
    <div className="fixed top-8 left-[50%] -translate-x-1/2 z-[99999] space-y-4">
      {alerts.map((alert) => (
        <Alert
          className={clsx(
            "shadow-2xl max-w-max mx-auto !whitespace-pre-wrap",
            className,
          )}
          key={alert.id}
          onClose={() => {
            handleClose(alert.id);
          }}
          open
          {...alert}
        >
          {alert.message}
        </Alert>
      ))}
    </div>
  );
}
