module.exports = (location) => (msg) => {
  if (msg.fields) {
    var field = msg.fields[0];
    console.log(`${field.code}: ${field.message}`);
  } else {
    console.log(`${location}: ${msg}`);
  }
};
