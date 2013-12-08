# CodeBoxes - CLI

This is the command line client to download CodeBoxes

```
  Usage: codebox [options]

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -d, --database [type]  Add the specified type of database [type]
    -l, --lang [type]      Add the specified type of platform [type]
```

### Example

`codebox --database mysql --lang php` 

This command will download the files to create a CodeBox with PHP and Apache with a MySQL database.
Note if the current container does not exist then CodeBoxes cannot create them, if you have ideas for a container, please visit [codebox-langs](https://github.com/codeboxes/codeboxes-langs) and [codebox-dbs](https://github.com/codeboxes/codeboxes-dbs). Pull requests are always welcome!

# Installing

Install via npm: `npm install codeboxes-client`

You can then run `codebox` from the terminal.