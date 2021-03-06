<%-- 
    Document   : index
    Created on : May 8, 2012, 7:03:11 AM
    Author     : Luis Salazar <bp.lusv@gmail.com>
--%>

<%
    if (session.getAttribute("user") == null) {
        response.sendRedirect("/lel/signIn");
    }
    response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    response.setHeader("Pragma", "no-cache");
    response.setDateHeader("Expires", -1);
%>
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>kDeL</title>
        <meta http-equiv="Content-Type" content="text/html;" charset="UTF-8" />
        <meta http-equiv="pragma" content="no-cache" /> 
        <meta http-equiv="expires" content="-1" />
        <link rel="icon" type="image/ico" href="img/favicon.ico">
        
        <link rel="stylesheet" type="text/css" href="css/tooltip.css" media="all" charset="UTF-8" />
        
        <link rel="stylesheet" href="js/lib/codemirror-2.35/lib/codemirror.css">
        <link rel="stylesheet" type="text/css" href="js/lib/jquery.confirm/jquery.confirm.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/base.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/index.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/account.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/classify.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/document.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/explore.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/manageDocuments.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/manageProjects.css" media="all" charset="UTF-8" />
        <link rel="stylesheet" type="text/css" href="css/manageProjectUsers.css" media="all" charset="UTF-8" />
        <meta name="author" content="Yanet Garay Santos,Luis Eduardo Salazar Valles" />
        <meta name="description" content="L�xico Extendido del lenguaje" />
        <meta name="keywords" content="UACJ,KDEL" />
        <!--[if lt IE 9]><script src="js/lib/html5-shim.js" type="text/javascript" charset="UTF-8"></script><![endif]-->
        
        <script src="js/lib/codemirror-2.35/lib/codemirror.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/lib/jquery-1.7.2.min.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/lib/jquery.confirm/jquery.confirm.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/lib/jquery.pwdStrength.js" type="text/javascript" charset="UTF-8"></script>
        
        <script src="js/controller/baseController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/accountController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/classifyController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/documentController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/exploreController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/manageDocumentsController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/manageProjectUsersController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/manageProjectsController.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/controller/registerController.js" type="text/javascript" charset="UTF-8"></script>
        
        <script src="js/events/base.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/account.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/classify.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/document.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/explore.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/manageProjectUsers.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/manageProjects.js" type="text/javascript" charset="UTF-8"></script>
        <script src="js/events/manageDocuments.js" type="text/javascript" charset="UTF-8"></script>
    </head>
    <body>
        <h3 id="notification"></h3>
        <img id="ajaxLoader" src="img/ajaxLoader.gif" />
        <header id="ixHeader">
            <a id="ixHeaderLogo" href="#!/manageProjects">
                <img src="img/headerLogo02.png" />
            </a>
            <div id="ixUserMenu">
                <div class="downArrow"></div>
                <span class="user overflowEllipsis"><c:out value="${user.name}" /></span>
                <div style="clear:both"></div>
                <ul class="popUp">
                    <li><a href="#!/manageProjects"><fmt:message key="projects" /></a></li>
                    <li>
                        <span class="lang"><fmt:message key="language" /></span>
                        <div class="leftArrow"></div>
                        <ul class="langPopUp">
                            <%-- When user hasn't explicitly set language,
                                    render toggle according to browser's preferred locale --%>
                            <c:set var="lang" value="${empty sessionScope['javax.servlet.jsp.jstl.fmt.locale.session'] ? pageContext.request.locale.language : sessionScope['javax.servlet.jsp.jstl.fmt.locale.session']}" />
                            <%-- language selection widget --%>
                            <c:choose>
                                <c:when test="${lang eq 'en'}">
                                    <li>
                                        <span>English</span>
                                        <div class="circle"></div>
                                    </li>
                                    <li>
                                        <a id="ixChooseLanguageEs" href="javascript:;">Espa�ol</a>
                                    </li>
                                </c:when>
                                <c:when test="${lang eq 'es'}">
                                    <li>
                                        <a id="ixChooseLanguageEn" href="javascript:;">English</a>
                                    </li>
                                    <li>
                                        <span>Espa�ol</span>
                                        <div class="circle"></div>
                                    </li>
                                </c:when>
                            </c:choose>
                        </ul>
                    </li>
                    <li><a href="#!/account"><fmt:message key="account" /></a></li>
                    <li><a id="ixSignOut" href="javascript:;" ><fmt:message key="sign out" /></a></li>
                </ul>
            </div>
            <div id="ixProjectTitle" style="display: ${empty project ? 'none' : 'block'}}">
                <h3 class="overflowEllipsis"><fmt:message key="project" /> - <span id="ixProjectName"><c:out value="${project.name}" /></span></h3>
            </div>
        </header>
        <nav class="tabs">
            <a href="#!/explore" id="exploreTab"><fmt:message key="explore" /></a>
            <a href="#!/document" id="documentTab"><fmt:message key="document" /></a>
            <a href="#!/manageProjects" id="projectsTab"><fmt:message key="projects" /></a>
        </nav>
        <div id="central"></div>
        <footer id="ixFooter">
            <img id="ixFooterBackground" src="img/footerBackground.png" />
        </footer>
        <div id="messages">
            <span class="networkFail"><fmt:message key="network fail" /></span>
            <span class="cancel"><fmt:message key="cancel" /></span>
            <span class="delete"><fmt:message key="remove" /></span>
            <span class="remove"><fmt:message key="remove" /></span>
            <span class="leave"><fmt:message key="leave" /></span>
            <span class="save"><fmt:message key="save" /></span>
            <span class="removeSymbolConfirmation"><fmt:message key="remove symbol confirmation" /></span>
            <span class="removeSymbolConfirmationTitle"><fmt:message key="remove symbol confirmation title" /></span>
            <span class="removeProjectUserConfirmation"><fmt:message key="remove project user confirmation" /></span>
            <span class="removeProjectUserConfirmationTitle"><fmt:message key="remove project user confirmation title" /></span>
            <span class="leaveProjectConfirmationTitle"><fmt:message key="leave project confirmation title" /></span>
            <span class="leaveProjectConfirmation"><fmt:message key="leave project confirmation" /></span>
            <span class="removeProjectConfirmationTitle"><fmt:message key="remove project confirmation title" /></span>
            <span class="removeProjectConfirmation"><fmt:message key="remove project confirmation" /></span>
            <span class="removeDocumentConfirmationTitle"><fmt:message key="remove document confirmation title" /></span>
            <span class="removeDocumentConfirmation"><fmt:message key="remove document confirmation" /></span>
            <span class="very_secure"><fmt:message key="very secure" /></span>
            <span class="secure"><fmt:message key="secure" /></span>
            <span class="very_strong"><fmt:message key="very strong" /></span>
            <span class="strong"><fmt:message key="strong" /></span>
            <span class="average"><fmt:message key="average" /></span>
            <span class="weak"><fmt:message key="weak" /></span>
            <span class="very_weak"><fmt:message key="very weak" /></span>
            <span class="owner"><fmt:message key="owner" /></span>
            <span class="description"><fmt:message key="description" /></span>
            <span class="load"><fmt:message key="load" /></span>
            <span class="edit"><fmt:message key="edit" /></span>
            <span class="users"><fmt:message key="users" /></span>
        </div>
    </body>
</html>