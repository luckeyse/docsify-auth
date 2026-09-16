# docsify-auth
a auth pulign for docsify

![](demo.png)

## Fork Updates

1. add username element for watermark use;
2. add logo element;
3. fix bug when there is no `nav` bar；
4. add keyboard event that can quickly submit after input the password;
5. add autocomplete for remember the username and password by the browser and autocomplete them;
6. add auto redirect when the authentication is successful;

## Usage

1. Configure docsify-auth:(配置)

    ```html
    <script>
    window.$docsify = {
      // auth
      auth: {
        enable: true, // 是否开启
        use: "sha256",
        logo: "./public/img/logo.jpg",
        users: ["zhangsan", "lisi"],
        password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", // md5密码
        title: "请输入密码以访问文档：", // 设置标题
        paths: ["^/bookmark"] // 需要认证的路径，支持正则表达式匹配
      }
    }
    </script>
    ```

2. Insert script into docsify document:

    ```html
    
    <!-- body -->
    <script src="https://cdn.jsdelivr.net/npm/js-sha256@0.9.0/build/sha256.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/docsify-auth@1.2.0/dist/docsify-auth.min.js"></script>

​	**If you would like to use original plugin, use the cdn link above is ok.**

​	**If you would like to use this fork plugin, please clone this repository and build the project code.**

​	You need to enter the source code folder, and use `npm` cmd to build the project code, like below:

```cmd
npm run build
```

