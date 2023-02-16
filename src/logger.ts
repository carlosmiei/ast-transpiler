import { green, yellow, red } from "colorette";

class Logger {
    static verbose = true;

    // static createInstanceIfNeeded(): void {
    //     if (!this._instance) {
    //         this._instance = new Logger();
    //       }
    // }

    static setVerboseMode(verbose: boolean) {
        this.verbose = verbose;
    }

    static log(message: string) {
        if (this.verbose) {
            console.log(message);
        }
    }

    static success(message: string) {
        this.log(green(`[SUCCESS]: ${message}`));
    }

    static warning(message: string) {
        this.log(yellow(`[WARNING]: ${message}`));
    }

    static error(message: string) {
        this.log(red(`[ERROR]: ${message}`));
    }
}

export {
    Logger
};

