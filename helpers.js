const hbs = require('hbs');

hbs.registerHelper('respuestaUsuario', function (conditional, options) {

  if (options.hash.value === conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper('cursoDisponible', function (conditional, options) {

  if (options.hash.value === conditional) {
    return options.fn(this)
  } else {
    return options.inverse(this);
  }
});


hbs.registerHelper('Rol', function (conditional, options) {

    if (options.hash.value === conditional) {
      return options.fn(this)
    } else {
      return options.inverse(this);
    }
  });