const {
    pathAndFilename,
    filterNonCamelCaseNames,
    filterKeywords,
    makeCssModuleType,
    finalDestDir,
} = require('../src/index')

test('correct path and filename', () => {
    const { currentDir, destFilename } = pathAndFilename("C:\\path\\to\\the\\File.css");

    expect(currentDir).toBe("C:\\path\\to\\the");
    expect(destFilename).toBe("FileStyles.re");
})

test('filter non-camel-cased items', () => {
    let classNames = [
        'red',
        'blue',
        'is-read',
        'is_read',
        'isRead',
        'title-box',
        'titleBox',
    ]

    expect(filterNonCamelCaseNames(classNames)).toEqual([
        'red',
        'blue',
        'isRead',
        'titleBox',
    ])
})

test('rename items whose name is reserved word', () => {
    let classNames = [
        'red',
        'and',
        'forYou',
        'includeNext',
        'let',
    ]

    let { validNames, keywordNames } = filterKeywords(classNames)

    expect(validNames).toEqual([
        'red',
        'forYou',
        'includeNext',
    ])
    expect(keywordNames).toEqual([
        'and',
        'let',
    ])
})

test('create valid ReasonML type', () => {
    let classNames = [
        'red',
        'forYou',
        'includeNext',
    ]

    expect(makeCssModuleType(classNames)).toBe(`
type definition = Js.t({.
    red: string,
    forYou: string,
    includeNext: string,
})
    `.trim())
})

describe('finalDestDir() tests', () => {
    test('query.destDir if set in query', () => {
        let query = {
            destDir: "C:\\user\\defined\\dir",
        }
    
        expect(finalDestDir(query, "C:\\current\\directory")).toBe(query.destDir)
    })
    
    test('./src/styles if not set in query', () => {
        let query = {
    
        }
    
        expect(finalDestDir(query, "C:\\current\\directory")).toBe('./src/styles')
    })
    
    test('currentDirectory if query.destDir is "current"', () => {
        let query = {
            destDir: "current",
        }
    
        expect(finalDestDir(query, "C:\\current\\directory")).toBe("C:\\current\\directory")
    })
})