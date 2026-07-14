
// 依赖配置项放到window.$docsify.auth 
/**
 * auth = {
 *   enable: true,
 *   use: "sha256", //默认sha256,支持md5
 *   password: "e10adc3949ba59abbe56e057f20f883e",
 *   paths: ["^/api"],
 *   title: "请输入密码以访问文档："
 * }
 * 
 * 
 */
import md5 from 'md5';

function validatePassword(inputPassword, encryptedPassword, inputUser, authUsers) {
    if(authUsers && authUsers.indexOf(inputUser) < 0) {
        return false;
    }
    var inputPasswordHash = sha256(inputPassword);
    if (window.$docsify.auth.use == "md5") {
        inputPasswordHash = md5(inputPassword);
    }
    return inputPasswordHash === encryptedPassword;
}

function injectStyle() {
    const styleEl = document.createElement("style");
    styleEl.textContent = `
    #auth-dialog {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 360px;
        width: 400px;
        border: 1px solid #eee;
        margin: 0 auto;
        margin-top: 20px;
      }
      #auth-dialog input {
        margin: 10px 0;
        padding: 10px;
        font-size: 16px;
      }
      #auth-dialog button {
        padding: 5px 10px;
        font-size: 16px;
        height: 40px;
        width: 90px;
        background: #168fff;
        color: white;
        border: none;
      }
      #auth-dialog button:hover {
        background: #40a9ff
      }
      #auth-dialog error-message {
        color: red;
        margin-top: 10px;
      }
    `;
    document.head.insertBefore(styleEl, document.querySelector("head style, head link[rel*='stylesheet']"));
}

function injectAuthDialog() {
    /**
     * <div id="auth-dialog" style="display: none;">
        <h2>请输入密码以访问文档：</h2>
        <input type="password" id="auth-pwd" placeholder="Password">
        <button onclick="checkPassword()">提交</button>
        <p id="error-message" style="color: red; display: none;">密码错误，无法访问文档。</p>
    </div>
     */
    let auth = window.$docsify.auth;
    let divEl = document.createElement('div');
    divEl.id = "auth-dialog";
    divEl.style.display = "none";
    divEl.innerHTML = `
        <div><img src="${auth.logo}" style="width:150px;margin-bottom:10px;"/></div>
        <div style="font-size:22px;font-weight:blod;">${auth.title}</div>
        <div><input type="text" id="auth-user" placeholder="User"></div>
        <div><input type="password" id="auth-pwd" placeholder="Password"></div>
        
        <button onclick="checkPassword()">提交</button>
        <p id="error-message" style="color: red; display: none;">密码错误，无法访问。</p>
    `;
    document.getElementsByTagName("body")[0].appendChild(divEl);
}

function setAuthDialog(isShow, reloadPage) {
    if (isShow) {
        document.getElementById('auth-dialog').style.display = 'flex';
        if (document.getElementsByClassName('github-corner')[0]) {
            document.getElementsByClassName('github-corner')[0].style.display='none';
        }
        document.getElementsByTagName('main')[0].style.display='none';
        if (document.getElementsByTagName('nav')[0]) {
            document.getElementsByTagName('nav')[0].style.display='none';
        }
    } else {
        document.getElementById('auth-dialog').style.display = 'none';
        if (document.getElementsByClassName('github-corner')[0]) {
            document.getElementsByClassName('github-corner')[0].style.display='block';
        }
        document.getElementsByTagName('main')[0].style.display='block';
        if (document.getElementsByTagName('nav')[0]) {
            document.getElementsByTagName('nav')[0].style.display='block';
        }
        if(reloadPage) {
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

export function install (hook, vm) {
    hook.init(function() {
        // 初始化并第一次加载完成数据后调用，没有参数。
        injectStyle();
        injectAuthDialog();
    });
    hook.beforeEach(function(content) {
        // 判断网页地址，是否需要认证，如果需要则弹出密码框
        // 根据window.$docsify.routerMode来适配获取当前路径
        let rm = window.$docsify.routeMode;
        var currentPath = window.location.hash.split('?')[0].split('#')[1] || '/';
        if (rm == "history") {
            currentPath = window.location.hash.split('?')[0].split('#')[0] || '/';
        }
        console.info("currentPath:" + currentPath);
        var needAuth = null;
        let auth = window.$docsify.auth;
        let paths = auth.paths;
        // 遍历配置，使用正则表达式匹配路径
        for (var i = 0; i < paths.length; i++) {
            // 匹配路径
            if (new RegExp(paths[i]).test(currentPath)) {
                needAuth = true;
                break;
            }
        }
        console.log("needAuth: ", auth, needAuth, !sessionStorage.getItem('authenticated'))
        // 是否开启认证，且需要认证，且还没有认证过
        let sha_user = sessionStorage.getItem('authenticated.user') ? sha256(sessionStorage.getItem('authenticated.user') + window.$docsify.auth.password) : '';
        let sha_pasd = sessionStorage.getItem('authenticated.password');
        let is_authenticated = sessionStorage.getItem('authenticated') && (sha_user && sha_user === sha_pasd);
        if (auth.enable && needAuth && !is_authenticated) {
            setAuthDialog(true);
            window.checkPassword = function() {
                let pwd = document.getElementById("auth-pwd").value;
                let user = document.getElementById("auth-user").value;
                if (validatePassword(pwd, window.$docsify.auth.password, user, window.$docsify.auth.users)) {
                    sessionStorage.setItem('authenticated.user', user);
                    sessionStorage.setItem('authenticated.password', sha256(user + window.$docsify.auth.password));
                    sessionStorage.setItem('authenticated', 'true');
                    setAuthDialog(false, true);
                } else {
                    document.getElementById('error-message').style.display = 'block';
                }
            }
            return '<div style="color:red;">认证成功, 页面1S后将刷新加载，若未跳转，请手动刷新访问！</div>';
        } else {
            setAuthDialog(false);
            return content;  // 返回原始内容
        }
    });
}