function State(target, key, descriptor) {
  target[`__internal_${key}`] = descriptor.value;

  if (typeof target.states == "undefined") {
    target.states = []
  }

  target.states.push(key)
  
  Object.defineProperty(target, key, {
    get() {
      return this[`__internal_${key}`];
    },
    set() {
      this[`__internal_${key}`] = descriptor.value;
      this.render();
    },
    configurable: true
  });
}
export default State