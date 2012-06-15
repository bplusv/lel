 <%-- 
    Document   : classify
    Created on : May 14, 2012, 10:12:22 AM
    Author     : Luis Salazar <bp.lusv@gmail.com>
--%>

<%@page contentType="text/html" pageEncoding="UTF-8"%>

<!DOCTYPE html>
<html>
    <head>
        <title>LeL</title>
        <meta http-equiv="Content-Type" content="text/html;" charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="<c:url value="/css/base.css" />" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="<c:url value="/css/index.css" />" media="all" charset="UTF-8" />
        <meta name="author" content="Yanet Garay Santos,Luis Eduardo Salazar Valles" />
        <meta name="description" content="Léxico Extendido del lenguaje" />
        <meta name="keywords" content="UACJ,LEL" />
        <!--[if lt IE 9]>
            <script src="//html5shim.googlecode.com/svn/trunk/html5.js"></script>
        <![endif]-->
        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript" charset="UTF-8" ></script>
        <script src="<c:url value="/js/controller.js" />" type="text/javascript" charset="UTF-8" ></script>
    </head>
    <body>
        <div id="center">
            <div id="leftSide">
                <img id="lelLogo" src="img/lelLogo.png" />
                <img id="bubblesBackground" src="img/signInBackground.png" />
            </div>
            <div id="rightSide">
                <form action="<c:url value="/doSignIn" />" id="signInForm" method="post" onsubmit="return controller('doSignIn', $(this).serialize());">
                    <h2 id="signInAd"><fmt:message key="sign in" /></h2>
                    <div class="signInField">
                        <label for="username"><strong><fmt:message key="username" /></strong></label>
                        <input type="text" maxlength="50" id="username" name="username" />
                    </div>
                    <div class="signInField">
                        <label for="password"><strong><fmt:message key="password" /></strong></label>
                        <input type="password" maxlength="255" id="password" name="password" />
                    </div>
                    <input type="submit" name="signIn" value="<fmt:message key="sign in" />" id="SignIn" class="button" />
                </form>
            </div>
            <div style="clear:both"></div>
        </div>
        <h3 id="notification" class="notification fail"></h3>
        <c:choose>
            <c:when test="${requestScope.signInError == true}">
                <h3 class="notification fail"><fmt:message key="sign in fail" /></h3>
            </c:when>
        </c:choose>
        <c:choose>
            <c:when test="${requestScope.sessionTimedOut == true}">
                <h3 class="notification fail"><fmt:message key="session timed out" /></h3>
            </c:when>
        </c:choose>
    </body>
</html>