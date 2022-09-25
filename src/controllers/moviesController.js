const path = require("path");
const db = require("../database/models");
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require("moment");

//Aqui tienen una forma de llamar a cada uno de los modelos
//const {Movie,Genre,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
  list: (req, res) => {
    db.Movie.findAll().then((movies) => {
      res.render("moviesList.ejs", { movies });
    });
  },
  detail: (req, res) => {
    db.Movie.findByPk(req.params.id,{
      include:['genre']
    })
    .then((movie) => {
      return res.render("moviesDetail.ejs", { movie });
    })
    .catch((error) => console.log(error));
  },
  new: (req, res) => {
    db.Movie.findAll({
      order: [["release_date", "DESC"]],
      limit: 5,
    }).then((movies) => {
      return res.render("newestMovies", { movies });
    })
    .catch((error) => console.log(error));
  },
  recomended: (req, res) => {
    db.Movie.findAll({
      where: {
        rating: { [db.Sequelize.Op.gte]: 8 },
      },
      order: [["rating", "DESC"]],
    }).then((movies) => {
      return res.render("recommendedMovies.ejs", { movies });
    })
    .catch((error) => console.log(error));
  },
  //Aqui dispongo las rutas para trabajar con el CRUD
  add: function (req, res) {
    Genres.findAll({
      order: ["name"],
    })
      .then((allGenres) => {
        return res.render("moviesAdd", { allGenres });
      })
      .catch((error) => console.log(error));
  },
  create: function (req, res) {
    const { title, release_date, genre_id, length, rating, awards } = req.body;
    Movies.create({
      title: title.trim(),
      length,
      rating,
      release_date,
      awards,
      genre_id,
    })
      .then((movie) => {
        console.log(movie)
            return res.redirect("/movies");
      })
      .catch((error) => console.log(error));
  },
  edit: function (req, res) {
    let Movie = Movies.findByPk(req.params.id,{
        include:[
            {
                association:'genre'
            }
        ]
    });
    let allGenres = Genres.findAll({
      order: ["name"],
    });
    Promise.all([Movie, allGenres])
      .then(([Movie, allGenres]) => {
        return res.render("moviesEdit", {
          Movie,
          allGenres,
          moment: moment,
        });
      })
      .catch((error) => console.log(error));
  },
  update: function (req, res) {
    const { title, release_date, genre_id, length, rating, awards } = req.body;
    Movies.update(
      {
        title: title.trim(),
        length,
        rating,
        release_date,
        awards,
        genre_id,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    )
      .then(() => {
        return res.redirect("/movies/detail/" + req.params.id);
      })
      .catch((error) => console.log(error));
  },
  delete: function (req, res) {
    const Movie = req.query
    return res.render('moviesDelete',{Movie})

  },
  destroy: function (req, res) {
    const{id}=req.params
    Movies.destroy({where:{id}})
      .then(()=>res.redirect('/movies'))
      .catch((error) => console.log(error));
  },
};

module.exports = moviesController;
