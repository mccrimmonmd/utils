module.exports = class Me {
  #exports

  constructor(outerModule, description) {
    this.#exports = outerModule.exports
    this.myself = {
      aboutMe: description
    }
    this.#exports.aboutMe = () => this.myself.aboutMe
    this.#exports.allAboutMe = () => this.myself
  }
  expose(
    name,
    obj,
    description,
    {
      shortDescription = description,
      parameters = {},
      returnType = void 0,
      // ...tests, etc.
    },
  ) {
    const isFunction = typeof obj === 'function'
    const entry = {
      description,
    }
    if (shortDescription !== description) {
      entry.shortDescription = shortDescription
    }
    if (isFunction) {
      entry.parameters = parameters.map((param) => {
        if (typeof param === 'string') 
      entry.returnType = returnType
    }
    this.myself[name] = entry
    // ...
    this.#exports[name] = obj
    return obj
  }
}

