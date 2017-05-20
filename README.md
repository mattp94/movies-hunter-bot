# Movies-Hunter Bot

A web bot used by *Movies-Hunter* (mine) to extract data on the Internet for your movies, by browsing disk locations:

1. It scans directories recursively in order to find potential movies.
2. Then, it uses the power of *Google Search* to find an *AlloCiné* code.
3. Finally, it extracts data from *AlloCiné* api, downloads poster + trailer and generates a thumbnail.
4. Next time, it will be able to use its own database to save time.

Because it scrapes *Google* and uses *AlloCiné* api, a random delay is thrown between each movie to avoid restrictions. Fortunately, it doesn't when there is no need to go on the Internet.

Data is saved in `data/db.json`. Posters, thumbnails and trailers are in `data`.



## Requirements

* [Node.js](https://nodejs.org/) v7 or newer
* [ImageMagick](https://www.imagemagick.org/) (convert)
* [FFmpeg](https://ffmpeg.org/) (ffprobe)



## Getting started

Go to the project's directory and build it:

```bash
npm install
```

To run the bot:

```bash
npm start
```

You can also create a cron job to launch it periodically.



## Configuration

In the project's root, you can see `config.yml` which allows you to make your own configuration. It's written in YAML, so respect the good syntax.


### Directories

```yml
directories:
    - /Users/matthieu/Movies
    - /Users/matthieu/Documents/Mes Films
```

In this part, `directories` contains paths that bot will explore to find potential movies. You can add as many as paths you want while they are **absolute** and **unique**.

Make sure you don't add the same path twice or children of an existing directory! Duplicates would be added in database...


### Extensions

```yml
extensions:
    - mkv
    - avi
    - iso
```

Here, you can define filename extensions (**lowercase**) which will be analyzed by the bot. **Only file** are supported! Videos or disk images for instance.



## Tags usage

If you want to add tags on your files, use `{{tag}}` notation anywhere in a filename.

For example, `Le Triomphe de Babar 1990 {{cartoon}} {{elephant}}.mkv` will save `['cartoon', 'elephant']` in database.

Special tags are used by the bot to do particular stuff:

* `{{ignore}}`: to ignore a **potential** movie.



## Reset

If you've got an issue and need to reset everything:

```bash
npm run reset
```
