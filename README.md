# Movies-Hunter Bot

A web bot used by *Movies-Hunter* (mine) to extract data on the Internet for your movies, by browsing disk locations:

1. It scans directories and files by following configuration requirements.
2. Then, it uses the power of *Google Search* to find an *AlloCiné* code.
3. Finally, it extracts data from *AlloCiné* api, downloads poster + trailer and generates a thumbnail.
4. Next time, it will be able to use its own database to save time.

Because it scrapes *Google* and uses *AlloCiné* api, a random delay is thrown between each movie to avoid restrictions. Fortunately, it doesn't when there is no need to go on the Internet.

Data is saved in `data/db.json`. Posters, thumbnails and trailers are in `data`.



## Requirements

I used the following versions:

* Node.js v6.9.1
* npm v3.10.8
* ImageMagick (convert) v6.9.4
* FFmpeg (ffprobe) v3.0



## Getting started

Go to the project's directory and build it:

```bash
npm install
```

To run the bot:

```bash
npm start
```

You can also create a cron job to launch it periodically:
```bash
0 5 * * * cd ~/movies-hunter-bot && npm start
```



## Configuration

In the project's root, you can see `config.yml` which allows you to make your own configuration. It's written in YAML, so respect the good syntax.


### Directories

```yml
directories:
    - /Users/matthieu/Movies
    - /Users/matthieu/Documents/Mes Films
```

In this part, `directories` contains paths that bot will explore to find potential movies. You can add as many as paths you want while they are absolute.


### Extensions

```yml
extensions:
    file:
        - mkv
        - avi
        - iso
    directory:
        - dvd
```

Here, you can define file or directory extensions (**lowercase**) which will be analyzed by the bot:
* `extensions.file`: a list of file extensions like video file, disk image, etc.
* `extensions.directory`: a list of directory extensions especially if you need to detect folders containing *VIDEO_TS* for instance. In the above case, just add *.dvd* to folders you want to analyze.


### Download

```yml
download:
    posters: true
    trailers: true
```

In the last part, you can manage what you want to download:
* `download.posters`: `true` or `false` to enable or not download of posters. If not, only an url to the resource will be saved in database.
* `download.trailers`: same as above but for trailers. Be careful, trailers can be large.



## Reset

If you've got an issue and need to reset everything, run `reset.bash`.
