"use client";
import { saveAs } from "file-saver";
import MyStudio from "@/components/my-studio";
import SqljsDriver from "@/drivers/sqljs-driver";
import { LucideFile, LucideLoader, LucideRefreshCw } from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Database, SqlJsStatic } from "sql.js";
import ScreenDropZone from "@/components/screen-dropzone";
import { toast } from "sonner";
import downloadFileFromUrl from "@/lib/download-file";
import { useSearchParams } from "next/navigation";
import { localDb } from "@/indexdb";
import { SavedConnectionLocalStorage } from "@/app/(theme)/connect/saved-connection-storage";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

function OverlayAround({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <>
      <div
        className="opacity-40 bg-black fixed z-30"
        style={{ left: 0, width: x + "px", top: 0, bottom: 0 }}
      ></div>
      <div
        className="opacity-40 bg-black fixed z-30"
        style={{ left: x + w + "px", right: 0, top: 0, bottom: 0 }}
      ></div>
      <div
        className="opacity-40 bg-black fixed z-30"
        style={{ left: x + "px", top: 0, height: y, width: w }}
      ></div>
      <div
        className="opacity-40 bg-black fixed z-30"
        style={{ left: x + "px", top: y + h + "px", bottom: 0, width: w }}
      ></div>
    </>
  );
}

function Onboarding() {
  const [onboard, setOnboard] = useState(
    () => !localStorage.getItem("sqlite-onboard-v1")
  );

  if (!onboard) return null;

  return (
    <>
      <OverlayAround x={15} y={8} w={50} h={50} />
      <div
        className="fixed z-40 bg-background p-3 rounded-lg shadow-lg text-sm"
        style={{ top: 10, left: 75 }}
      >
        <h2 className="font-semibold text-lg">There is more!</h2>
        <ul className="list-disc mt-2 mb-4 mx-4">
          <li>
            You can <strong>open</strong> and <strong>save</strong> your SQLite
            database here.
          </li>
          <li>Switch dark and light mode</li>
          <li>And many more in the future</li>
        </ul>
        <Button
          size={"sm"}
          onClick={() => {
            setOnboard(false);
            localStorage.setItem("sqlite-onboard-v1", "1");
          }}
        >
          Got it
        </Button>
      </div>
    </>
  );
}

export default function PlaygroundEditorBody({
  preloadDatabase,
}: {
  preloadDatabase?: string | null;
}) {
  const [sqlInit, setSqlInit] = useState<SqlJsStatic>();
  const searchParams = useSearchParams();
  const [databaseLoading, setDatabaseLoading] = useState(!!preloadDatabase);
  const [rawDb, setRawDb] = useState<Database>();
  const [db, setDb] = useState<SqljsDriver>();
  const [handler, setHandler] = useState<FileSystemFileHandle>();
  const [fileName, setFilename] = useState("");

  const onReady = useCallback(() => {
    window
      .initSqlJs({
        locateFile: (file) => `/sqljs/${file}`,
      })
      .then(setSqlInit);
  }, []);

  useEffect(() => {
    if (sqlInit) {
      if (preloadDatabase) {
        downloadFileFromUrl(preloadDatabase)
          .then((r) => {
            const sqljsDatabase = new sqlInit.Database(new Uint8Array(r));
            setRawDb(sqljsDatabase);
            setDb(new SqljsDriver(sqljsDatabase));
          })
          .finally(() => setDatabaseLoading(false));
      } else if (searchParams.get("s")) {
        const sessionId = searchParams.get("s");
        if (!sessionId) return;

        const session = SavedConnectionLocalStorage.get(sessionId);
        if (!session) return;

        const fileHandlerId = session?.config.filehandler;
        if (!fileHandlerId) return;

        localDb.file_handler.get(fileHandlerId).then((sessionData) => {
          if (sessionData?.handler) {
            sessionData.handler.queryPermission().then((permission) => {
              if (permission !== "granted") {
                sessionData.handler.requestPermission().then(() => {
                  setHandler(sessionData.handler);
                });
              } else {
                setHandler(sessionData.handler);
              }
            });
          }
        });
      } else {
        const sqljsDatabase = new sqlInit.Database();
        setRawDb(sqljsDatabase);
        setDb(new SqljsDriver(sqljsDatabase));
      }
    }
  }, [sqlInit, preloadDatabase, searchParams]);

  useEffect(() => {
    if (handler && sqlInit) {
      handler.getFile().then((file) => {
        setFilename(file.name);
        file.arrayBuffer().then((buffer) => {
          const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
          setRawDb(sqljsDatabase);
          setDb(new SqljsDriver(sqljsDatabase));
        });
      });
    }
  }, [handler, sqlInit]);

  const onReloadDatabase = useCallback(() => {
    if (db && db.hasChanged()) {
      if (
        !confirm(
          "You have some changes. Refresh will lose your change. Do you want to refresh"
        )
      ) {
        return;
      }
    }

    if (handler && sqlInit) {
      handler.getFile().then((file) => {
        file.arrayBuffer().then((buffer) => {
          const sqljsDatabase = new sqlInit.Database(new Uint8Array(buffer));
          setRawDb(sqljsDatabase);
          if (db) {
            db.reload(sqljsDatabase);
          }
        });
      });
    }
  }, [handler, sqlInit, db]);

  const sidebarMenu = useMemo(() => {
    return (
      <div>
        {fileName && (
          <div className="p-2 text-sm rounded m-2 bg-yellow-300 text-black flex gap-2">
            <div className="flex justify-center items-center">
              <LucideFile />
            </div>
            <div>
              <div className="text-xs">Editing File</div>
              <strong>{fileName}</strong>
            </div>
          </div>
        )}

        <DropdownMenuItem
          inset
          onClick={() => {
            if (rawDb) {
              if (handler) {
                handler
                  .createWritable()
                  .then((writable) => {
                    writable.write(rawDb.export());
                    writable.close();
                    toast.success(
                      <div>
                        Successfully save <strong>{fileName}</strong>
                      </div>
                    );
                    db?.resetChange();
                  })
                  .catch(console.error);
              } else {
                saveAs(
                  new Blob([rawDb.export()], {
                    type: "application/x-sqlite3",
                  }),
                  "sqlite-dump.db"
                );
              }
            }
          }}
        >
          Save
        </DropdownMenuItem>
        <DropdownMenuItem
          inset
          onClick={() => {
            window
              .showOpenFilePicker({
                types: [
                  {
                    description: "SQLite Files",
                    accept: {
                      "application/x-sqlite3": [
                        ".db",
                        ".sdb",
                        ".sqlite",
                        ".db3",
                        ".s3db",
                        ".sqlite3",
                        ".sl3",
                        ".db2",
                        ".s2db",
                        ".sqlite2",
                        ".sl2",
                      ],
                    },
                  },
                ],
              })
              .then(([fileHandler]) => {
                setHandler(fileHandler);
              });
          }}
        >
          Open SQLite file
        </DropdownMenuItem>

        {handler && (
          <DropdownMenuItem onClick={onReloadDatabase}>
            <LucideRefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
      </div>
    );
  }, [rawDb, handler, db, fileName, onReloadDatabase]);

  useEffect(() => {
    if (handler && db) {
      const onBeforeClose = (e: Event) => {
        if (db.hasChanged()) {
          e.preventDefault();
          return "Are you sure you want to close without change?";
        }
      };

      window.addEventListener("beforeunload", onBeforeClose);
      return () => window.removeEventListener("beforeunload", onBeforeClose);
    }
  }, [db, handler]);

  const dom = useMemo(() => {
    if (databaseLoading) {
      return (
        <div className="p-4">
          <LucideLoader className="w-12 h-12 animate-spin mb-2" />
          <h1 className="text-2xl font-bold mb-2">Loading Database</h1>
          <p>
            Please wait. We are downloading:
            <br />
            <strong>{preloadDatabase}</strong>
          </p>
        </div>
      );
    }

    if (db) {
      return (
        <MyStudio
          color="gray"
          name="Playground"
          driver={db}
          sideBarFooterComponent={sidebarMenu}
        />
      );
    }

    return <div></div>;
  }, [databaseLoading, preloadDatabase, db, sidebarMenu]);

  return (
    <>
      <Script src="/sqljs/sql-wasm.js" onReady={onReady} />
      <ScreenDropZone onFileDrop={setHandler} />
      <Onboarding />
      {dom}
    </>
  );
}
