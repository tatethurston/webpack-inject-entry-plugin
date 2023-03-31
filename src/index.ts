import { validate } from "schema-utils";
import webpack from "webpack";
import type { Compiler, Configuration, Entry } from "webpack";
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

function injectEntryWebpack5(
  options: Compiler["options"],
  entryName: string,
  injectFilepath: string
): void {
  const originalEntry = options.entry;
  options.entry = async () => {
    const entries =
      typeof originalEntry === "function"
        ? await originalEntry()
        : originalEntry;
    const injectEntry = entries[entryName];
    if (!injectEntry.import) {
      throw new Error(
        `Could not find an entry named '${entryName}'. See https://webpack.js.org/concepts/entry-points/ for an overview of webpack entries.`
      );
    }
    if (!injectEntry.import.includes(injectFilepath)) {
      injectEntry.import.unshift(injectFilepath);
    }
    return entries;
  };
}

function injectEntryWebpack4(
  options: Compiler["options"],
  entryName: string,
  injectFilepath: string
): void {
  function injectEntry(entry: Configuration["entry"]): string[] | Entry {
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
            // @ts-expect-error webpack4
            [entryName]: injectEntry(entry[entryName]) as unknown as string[],
          };
        }
      }
      case "function": {
        throw new Error(
          "Invariant: Recieved unexpected value for entry: function"
        );
      }
      default: {
        const _exhaust: never = entry;
        console.error(
          Error(
            `Invariant: Recieved unexpected value for entry: ${typeof entry}`
          )
        );
        return _exhaust;
      }
    }
  }

  const entry = options.entry;
  typeof entry === "function"
    ? // @ts-expect-error webpack4
      (options.entry = () => Promise.resolve(entry()).then(injectEntry))
    : // @ts-expect-error webpack4
      (options.entry = () => injectEntry(entry));
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
