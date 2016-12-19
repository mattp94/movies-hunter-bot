# Movies-Hunter Bot

A web bot used by *Movies-Hunter* to extract data on the Internet for your movies, by browsing disk locations:

1. It scans directories and files by following configuration requirements.
2. Then, it uses the power of *Google Search* to find an *AlloCiné* code.
3. Finally, it extracts data from *AlloCiné* api, downloads poster + trailer and generates a thumbnail.
4. Next time, it will be able to use its own database to save time.

Because it scraps *Google* and uses *AlloCiné* api, a random delay is thrown between each movie to avoid restrictions. Fortunately, it doesn't when bot doesn't need to go on the Internet.

Data is saved in `data/db.json`. Posters, thumbnails and trailers are downloaded in `data`.



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
0 4 * * * cd ~/movies-hunter-bot && npm start
```



## Configuration

In the project's root, you can see the `config.yml` file which allows you to make your own configuration. It's written in YAML, so respect the good syntax.


### Directories

```yml
directories:
    - /Users/matthieu/Movies
    - /Users/matthieu/Documents/Mes Films
```

In this part, `directories` contains paths that bot will explore to find potiential movies. You can add as many as directories you want while you use absolute paths.


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

Here, you can define file or directory extensions which will be analyzed:
* `extensions.file`: a list of file extensions like video file, disc image, etc.
* `extensions.directory`: a list of directory extensions especially if you need to detect folders containing *VIDEO_TS* for instance. In the above case, just add *.dvd* to folders you want to add.


### Download

```yml
download:
    posters: true
    trailers: true
```

In the last part, you can manage what you want to download:
* `download.posters`: activates posters' download or not. If not, only an url to the resource will be saved in database.
* `download.trailers`: same as above but for trailers. Be careful, trailers can be large.



## Reset

If you've got an issue and need to reset everything, run `reset.bash`.
