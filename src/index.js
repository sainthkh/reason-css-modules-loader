import cssLoader from 'css-loader';
import { getOptions } from 'loader-utils';
const path = require('path');
const fs = require('fs-extra')

export default function loader(...input) {
    if(this.cacheable) this.cacheable();

    let query = getOptions(this.query);
    query = Object.assign({}, query, {
        modules: true,
        camelCase: true,
    });

    const log = makeLogger(query.silent);

    const moduleMode = query.modules;
    if (!moduleMode) {
        log(`Reason CSS Modules loader: option "modules" is not active - skipping extraction.`)
        cssLoader.call(this, ...input);
    }

    // Our goal:
    // Call our code before css-loader is executed.

    // Step 1. Create normal callback. 
    const callback = this.async();

    // Step 2. Create our callback and execute our code. 
    let async = () => (err, content) => {
        if (err) {
            return callback(err);
        }
        const filepath = this.resourcePath;
        const { currentDir, destFilename } = pathAndFilename(filepath);

        const keyRegex = /"([^\\"]+)":/g;
        let classNames = [];
        let match;

        while (match = keyRegex.exec(content)) {
            if (classNames.indexOf(match[1]) < 0) {
                classNames.push(match[1]);
            }
        }

        classNames = filterNonCamelCaseNames(classNames);
        let { validNames, keywordNames } = filterKeywords(classNames);
        if (keywordNames.length > 0) {
            log(`${path.basename(filepath)} has classNames that are ReasonML keywords:`)
            log(`${keywordNames.map(keyword => `  - ${keyword}`).join('\n')}`)
            log(`They are removed from the module definition.`)
        }

        let reasonType = makeCssModuleType(validNames);

        let destDir = finalDestDir(query, currentDir);
        saveFileIfChanged(destDir, destFilename, reasonType);

        // Step 3. Call css-loader
        callCssLoader(this, input, query, () => callback);
    }

    callCssLoader(this, input, query, async);
}

function callCssLoader(_this, input, query, async) {
    let context = Object.assign({}, _this, {
        query,
        async,
    })

    cssLoader.call(context, ...input);
}

export function makeLogger(silent) {
    return (slient) => {
        if (silent) {
            return () => {};
        }
        return (...args) => console['warn'](...args);
    }
}

export function pathAndFilename(filepath) {
    let { dir, name } = path.parse(filepath);
    return {
        currentDir: dir,
        destFilename: `${name}Styles.re`,
    }
}

export function filterNonCamelCaseNames(classNames) {
    return classNames.filter(className => /^[A-Za-z0-9]+$/i.test(className))
}

let keywords = [
    "and", "as", "assert", "begin", "class", "constraint", "do", "done", "downto", "else",
    "end", "exception", "external", "false", "for", "fun", "function", "functor", "if",
    "in", "include", "inherit", "initializer", "lazy", "let", "method", "module", "mutable",
    "new", "nonrec", "object", "of", "open", "or", "private", "rec", "sig", "struct", "switch",
    "then", "to", "true", "try", "type", "val", "virtual", "when", "while", "with",
]

export function filterKeywords(classNames) {
    let validNames = []
    let keywordNames = []
    
    classNames.forEach(className => {
        if (keywords.includes(className)) {
            keywordNames.push(className)
        } else {
            validNames.push(className)
        }
    })

    return {
        validNames,
        keywordNames,
    }
}

export function makeCssModuleType(validNames) {
    return `
type definition = Js.t({.
${validNames.map(name => 
    `    ${name}: string,`
).join('\n')}
})
    `.trim();
}

export function finalDestDir(query, currentDir) {
    if(query.destDir == "current") {
        return currentDir;
    } else if(query.destDir) {
        return query.destDir;
    } else {
        return './src/styles'
    }
}

export function saveFileIfChanged(destDir, filename, reasonType) {
    fs.ensureDirSync(destDir);

    let filePath = path.join(destDir, filename)
    if (fs.existsSync(filePath)) {
        let currentContent = fs.readFileSync(filePath).toString()

        if(currentContent !== reasonType) {
            fs.writeFileSync(filePath, reasonType)
        }
    } else {
        fs.writeFileSync(filePath, reasonType)
    }
}
