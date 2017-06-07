define(
  [],
  function () {
    class ObservableArray extends Array {

      constructor(array = []) {
        super();
        this.internalArray = array;
        this.observers = [];
      }

      push(element) {
        this.internalArray.push(element);
        this.observers.forEach(function (observer) {
          if (observer["pushed"]) {
            observer["pushed"](this, element);
          }
        });
      }

      pop() {
        var popped = this.internalArray.pop();
        this.observers.forEach(function (observer) {
          if (observer["popped"]) {
            observer["popped"](this, popped);
          }
        });
        return popped;
      }

      clear() {
        this.internalArray = [];
        this.observers.forEach(function (observer) {
          if (observer["cleared"]) {
            observer["cleared"](this);
          }
        });
      }

      register(observer) {
        this.observers.push(observer);
      }

      find(callback, thisArg) {
        return this.internalArray.find(callback, thisArg);
      }

    }

    return ObservableArray;
  }
);