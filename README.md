# CodeBoxes - CLI

This is the command line client to download CodeBoxes

```
  Usage: codebox [options]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -b, --boxes [type]  Add the specified types of boxes to be downloaded [-b php,mysql]

```

### Example

`codebox -b nodejs,mongo` 

This command will download the files to create a CodeBox with PHP and Apache with a MySQL database.
Note if the current container does not exist then CodeBoxes cannot create them, if you have ideas for a container, please visit [the box repo](https://github.com/codeboxes/box-repo). Pull requests are always welcome!

# Installing

Install via npm: `npm install -g codeboxes-client`

You can then run `codebox` from the terminal.
