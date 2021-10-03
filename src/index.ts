import { validate } from "schema-utils";
import webpack from "webpack";
import type { Compiler, Configuration, Entry, EntryFunc } from "webpack";
import { Schema } from "schema-utils/declarations/ValidationError";

export interface InjectEntryPluginConfig {
  /**
   * The name of the [webpack entry](https://webpack.js.org/concepts/entry-points/).
   */
  entry: string;
  /**
   * The filepath to the source code to inject.
   */
  filepath: string;
}

const schema: Schema = {
  type: "object",
  properties: {
    entry: {
      type: "string",
    },
    filepath: {
      type: "string",
    },
    additionalProperties: false,
  },
};

/* eslint-disable */
function injectEntryWebpack5(
  options: Compiler["options"],
  entryName: string,
  injectFilepath: string
): void {
  const entry: any =
    typeof options.entry === "function"
      ? options.entry()
      : Promise.resolve(options.entry);

  options.entry = () =>
    entry.then((e: any) => {
      const injectEntry: typeof e[string] | undefined = e[entryName];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!injectEntry?.import) {
        throw new Error(
          `Could not find an entry named '${entryName}'. See https://webpack.js.org/concepts/entry-points/ for an overview of webpack entries.`
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!injectEntry.import.includes(injectFilepath)) {
        injectEntry.import.unshift(injectFilepath);
      }
      return e;
    });
}
/* eslint-enable */

function injectEntryWebpack4(
  options: Compiler["options"],
  entryName: string,
  injectFilepath: string
): void {
  function injectEntry(
    entry: Exclude<Configuration["entry"], EntryFunc>
  ): string[] | Entry {
    switch (typeof entry) {
      case "undefined": {
        throw new Error(
          `Could not find an entry named '${entryName}'. See https://webpack.js.org/concepts/entry-points/ for an overview of webpack entries.`
        );
      }
      case "string": {
        return [injectFilepath, entry];
      }
      case "object": {
        if (Array.isArray(entry)) {
          if (!entry.includes(injectFilepath)) {
            return [injectFilepath, ...entry];
          }
          return entry;
        } else {
          return {
            ...entry,
            [entryName]: injectEntry(entry[entryName]) as unknown as string[],
          };
        }
      }
      default: {
        const _exhaust: never = entry;
        return _exhaust;
      }
    }
  }

  const entry = options.entry;
  typeof entry === "function"
    ? (options.entry = () => Promise.resolve(entry()).then(injectEntry))
    : (options.entry = () => injectEntry(entry));
}

export default class InjectEntryPlugin {
  config: InjectEntryPluginConfig;

  constructor(options: InjectEntryPluginConfig) {
    validate(schema, options, {
      name: "Inject Entry Webpack Plugin",
      baseDataPath: "options",
    });
    this.config = options;
  }

  apply(compiler: Compiler): void {
    const { entry, filepath } = this.config;
    if (!webpack.version || webpack.version.startsWith("4")) {
      injectEntryWebpack4(compiler.options, entry, filepath);
    } else {
      injectEntryWebpack5(compiler.options, entry, filepath);
    }
  }
}
