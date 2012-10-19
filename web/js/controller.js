/* 
 * The MIT License
 *
 * Copyright 2012 Luis Salazar <bp.lusv@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

window.controller = (function($, CodeMirror) {
    'use strict';
    var infoBubble;
    var appContext = '/lel';
    var projectSymbols = {};
    var symbolsRegex;
    var api = {};
    
    var ajaxRequest = function(request, callback, params, async) {
        var response, redirect;
        var isRequesting = false;
        if (!isRequesting) {
            isRequesting = true;
            $('#notification').hide();
            $('#ajaxLoader').show();
            $.ajax({
                type: /\/([^\/]*)\//.exec(request)[1],
                url: appContext + request,
                data: params,
                timeout: 5000,
                success: function(data) {
                    isRequesting = false;
                    response = data;
                    if ($(response).find('sessionTimeOut').text() === 'true') {
                        window.location.href = appContext + '/signIn';
                        return;
                    }
                    redirect = callback && callback(response);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                    isRequesting = false;
                    response = $('<response>').append(
                        $('<message>').text(
                            $('#messages .networkFail').text()));
                },
                complete: function() {
                    isRequesting = false;
                    updateMainInterface(response, redirect);
                },
                async: async === undefined ? true : async
            });
        }
    }
    
    var notify = function(cssClass, message) {
        var $notification = $('#notification');
        $notification
        .removeClass()
        .addClass(cssClass)
        .stop(true, true)
        .show()
        .html(message)
        .animate({
            opacity: 1
        }, 3000)
        .fadeOut(500);
    }

    var regexEscape = function (text) {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    }

    var updateSymbolsRegex = function() {
        var words = [];
        for (var key in projectSymbols) {
            if (projectSymbols.hasOwnProperty(key)) {
                words.push(key);
            }
        }
        words = words.sort().reverse().map(regexEscape);
        symbolsRegex = RegExp("^((" + words.join(")|(") + "))", "");
    }
    
    var updateProjectSymbols = function() {
        ajaxRequest('/get/data/projectSymbols', function(response) {
            projectSymbols = {};
            var $xmlSymbols = $(response).find('symbols').children();
            $xmlSymbols.each(function(i, e) {
                projectSymbols[$(e).children('name').text()] = $(e).attr('id');
            });
            updateSymbolsRegex();
        }, null, false);
    };
    
    var updateCodeMirrorLelMode = function() {
        CodeMirror.defineMode("lel", function() {
            function tokenLexer(stream) {
                if (stream.eatSpace()) return null;
                var match = stream.match(symbolsRegex);
                if (match && match[0]) {
                    return 'symbol-' + projectSymbols[match[0]];
                } else {
                    stream.next();
                    return null;
                }
            }
            return {
                token: function(stream) {
                    return tokenLexer(stream);
                }
            };
        });
        CodeMirror.defineMIME("text/x-lel", "lel");
    }
    
    var updateCodeMirrorEditors = function() {
        updateCodeMirrorLelMode();
        $('textarea.symbolicEditor').each(function(i,e) {
            var cm = $(e).data('codeMirror');
            if (cm != undefined) {
                cm.setOption('mode', 'text/x-lel');
            } else {
                var w = $(e).outerWidth();
                var h = $(e).outerHeight();
                var editor = CodeMirror.fromTextArea(e,
                {
                    'onUpdate': tagCodeMirrorSymbols,
                    'onScroll': tagCodeMirrorSymbols,
                    'mode': 'text/x-lel', 
                    'lineWrapping': false
                });
                $(e).data('codeMirror', editor);
                editor.setSize(w, h);
                editor.refresh();
            }
        });
        tagCodeMirrorSymbols();
    };

    var tagCodeMirrorSymbols = function() {
        var $cms = $('div.CodeMirror');
        $cms.each(function(i, cm) {
            var $cm = $(cm);
            var cmTop = $cm.offset().top;
            var cmBottom = $cm.offset().top + $cm.outerHeight();
            var cmLeft = $cm.offset().left;
            var cmRight = $cm.offset().left + $cm.outerWidth();
            var $symbols = $cm.find('div.CodeMirror-lines span[class^=cm-symbol-]').
            filter(function() {
                var curOffset = $(this).offset();
                var curTop = curOffset.top;
                var curLeft = curOffset.left;
                return curTop > cmTop && curTop < cmBottom &&
                curLeft > cmLeft && curLeft < cmRight;
            });
            $symbols.each(function(i, e) {
                $(e).wrapInner('<a class="symbol" href="#!/classify?sy='+
                    /cm-symbol-(.*)/.exec($(e).attr('class'))[1] + '"></a>');
                $(e).attr('class', 'symbol');
            });
        });
    }
    
    var tagSymbols = function(text) {
        var result = '';
        while (text) {
            var match = text.match(symbolsRegex);
            if (match && match[0]) {
                result += $('<a>').addClass('symbol').attr('href', '#!/classify?sy=' + 
                    projectSymbols[match[0]]).text(match[0]).get(0).outerHTML;
                text = text.substring(match[0].length);
            } else {
                result += $('<span>').text(text.charAt(0)).html();
                text = text.substring(1);
            }
        }
        return result;
    }
    
    var getPwdScoreCssClass = function(pwdScore) {
        var pwdClass = '';
        if (pwdScore >= 90) {
            pwdClass = 'very_secure';
        } else if (pwdScore >= 80) {
            pwdClass = 'secure';
        } else if (pwdScore >= 70) {
            pwdClass = 'very_strong';
        } else if (pwdScore >= 60) {
            pwdClass = 'strong';
        } else if (pwdScore >= 50) {
            pwdClass = 'average';
        } else if (pwdScore >= 25) {
            pwdClass = 'weak';
        } else if (pwdScore >= 0) {
            pwdClass = 'very_weak';
        }
        return pwdClass;
    };
    
    var updateMainInterface = function(response, redirect) {
        if (redirect) {
            if (window.location.hash.indexOf(redirect) > -1) {
                $(window).trigger('hashchange');
            } else {
                window.location.hash = redirect;
            }
        }
        $('.overflowEllipsis').each(function(i,e) {
            if ($(e).children('.overflowText').length < 1) {
                $(e).wrapInner('<span class="overflowText">');
            }
        });
        $('.tabs a').removeClass('selected');
        if (window.location.hash.indexOf('/explore') > 0) {
            $('#exploreTab').addClass('selected');
        } else if (window.location.hash.indexOf('/document') > 0) {
            $('#documentTab').addClass('selected');
        } else if (window.location.hash.indexOf('/manageProjects') > 0) {
            $('#projectsTab').addClass('selected');
        }
        $('#ajaxLoader').hide();
        if (response) {
            var success = $(response).find('success').text();
            var message = $(response).find('message').text();
            if (message) notify(success === 'true' ? 'success' : 'fail', message);
        }
    };
    
    api.changeLanguage = function(lang) {
        ajaxRequest('/post/chooseLanguage', function(response) {
            if ($(response).find('success').text() === 'true') {
                window.location.reload();
            }
        }, 'language=' + lang);
    };
    
    api.changeView = function(hash) {
        if (window.location.href.indexOf('/signIn') < 0) {       
            if (hash){
                if ($('#dcUpdateForm').length > 0) {
                    $('#dcDocumentContent').data('codeMirror').save();
                    ajaxRequest('/post/updateDocument', null, 
                        $('#dcUpdateForm').serialize(), false);
                }   
                hash = hash.replace(/#!/, '');
                hash = hash.split('?');
                ajaxRequest('/get/view' + hash[0], 
                    function(res) {
                        switch(hash[0]) {
                            case '/classify':
                                updateProjectSymbols();
                                $('#central').html(res);
                                updateCodeMirrorEditors();
                                api.classify.updateInterface();
                                break;
                            case '/document':
                                updateProjectSymbols();
                                $('#central').html(res);
                                updateCodeMirrorEditors();
                                break;
                            default:
                                $('#central').html(res);
                                break;
                        }
                    }, hash[1]);
            } else {
                window.location.hash = '#!/explore';
            }
        }
    };
        
    api.account = {};
    api.account.changePassword = function() {
        ajaxRequest('/post/changePassword', function(response) {
            if ($(response).find('success').text() === 'true') {
                $('.acChangePassField input').val('');
                $('#acNewPasswordStrength').text('');
                $('#acNewPasswordStrengthBar').width(0);
            }
        }, $('#acChangePassForm').serialize());
    };
    api.account.checkPasswordStrength = function() {
        var $passStrength = $('#acNewPasswordStrength');
        var $passStrengthBar = $('#acNewPasswordStrengthBar');
        var newPass = $('#acNewPassword').val();
        if (newPass) {
            var pwdScore = $.pwdStrength(newPass);
            var pwdClass = getPwdScoreCssClass(pwdScore);
            $passStrength.removeClass();
            $passStrength.addClass(pwdClass);
            $passStrength.text($('#acMessages').find('.' + pwdClass).text());
            $passStrengthBar.removeClass();
            $passStrengthBar.addClass(pwdClass);
            $passStrengthBar.width($passStrength.width() * pwdScore / 100); 
        } else {
            $passStrength.text('');
            $passStrengthBar.width(0);
        }
    };
    
    api.classify = {};
    api.classify.cancelSelectSynonym = function() {
        $('#clSynonymsSelect').val(-1);
        $('#clSynonymsSelect').css('display', 'none');
        $('#clCancelGroup').css('display', 'none');
        $('#clSaveGroup').css('display', 'none');
        $('#clChangeGroup').css('display', 'inline');
        api.classify.selectSynonym($('#clSymbol').val());
    }
    api.classify.createSymbol = function() {
        ajaxRequest('/post/createSymbol', function(response) {
            if ($(response).find('success').text() === 'true') {
                $('#clCancelGroup').css('display', 'none');
                $('#clSaveGroup').css('display', 'none');
                $('#clChangeGroup').css('display', 'inline');
                $('#clSynonymsSelect').val(-1);
                $('#clSynonymsSelect').css('display', 'none');
                $('#clSymbol').val($(response).find('symbol').attr('id'));
                $('#clForm').attr('action', '/post/updateSymbol');
                $('#clDefinitionTop > div.right').css('visibility', 'visible');
                $('#clLogUserName').text($(response).find('log > user > name').text());
                $('#clLogDate').text($(response).find('log > date').text());
                updateProjectSymbols();
                updateCodeMirrorEditors();
                api.classify.updateComments(response);
            }
        }, $('#clForm').serialize());
    };
    api.classify.leaveSynonymsGroup = function(params) {
        ajaxRequest('/post/leaveSynonymsGroup', function(response) {
            if ($(response).find('success').text() === 'true') {
                $('#clLeaveGroup').css('display', 'none');
                $('#clSynonymsGroup').html('');
                $('#clLogUserName').text($(response).find('log > user > name').text());
                $('#clLogDate').text($(response).find('log > date').text());
                $('#clNotion').data('codeMirror').setValue('');
                $('#clActualIntention').data('codeMirror').setValue('');
                $('#clFutureIntention').data('codeMirror').setValue('');
                $('#clNewComment').data('codeMirror').setValue('');
                api.classify.updateComments(response);
            }
        }, $('#clForm').serialize());
    };
    api.classify.selectSynonym = function(id) {
        ajaxRequest('/get/data/classifySelectSynonym', function(response) {
            var $xmlSynonyms = $(response).find('synonymsGroup').children();
            var synonyms = [];
            $xmlSynonyms.each(function(i, e) {
                if ($(e).attr('id') != $('#clSymbol').val())
                    synonyms.push($('<a>').attr('href','#!/classify?sy='+ 
                        $(e).attr('id')).text($(e).children('name').text()).get(0).outerHTML);
            });
            $('#clSynonymsGroup').html(synonyms.join(', '));
            if ($(response).find('symbol').attr('id') === $('#clSymbol').val()) {
                $('#clLeaveGroup').css('display', synonyms.length > 0 ? 'inline' : 'none');
            }
            $('#clDocumentTitle').text($(response).find('document > name').text() || $('#clDocumentName').val());
            $('#clCategory').val($(response).find('category').text());
            $('#clClassification').val($(response).find('classification').text());
            $('#clLogUserName').text($(response).find('log > user > name').text());
            $('#clLogDate').text($(response).find('log > date').text());
            $('#clNotion').data('codeMirror').setValue($(response).find('notion').text());
            $('#clActualIntention').data('codeMirror').setValue($(response).find('actualIntention').text());
            $('#clFutureIntention').data('codeMirror').setValue($(response).find('futureIntention').text());
            api.classify.updateComments(response);
            api.classify.updateInterface();
        }, 'symbol=' + id);
    };
    api.classify.hideComments = function() {
        $('#clComments').css('display', 'none');
        $('#clShowComments').css('display', 'inline-block');
        $('#clHideComments').css('display', 'none');
    };
    api.classify.showComments = function() {
        $('#clComments').css('display', 'block');
        $('#clShowComments').css('display', 'none');
        $('#clHideComments').css('display', 'inline-block');
    };
    api.classify.showSynonyms = function() {
        $(window).scrollTop($('#clTitle').offset().top);
        $('#clSynonymsSelect').css('display', 'block');
        $('#clLeaveGroup').css('display', 'none');
        $('#clChangeGroup').css('display', 'none');
        $('#clCancelGroup').css('display', 'inline');
        $('#clSaveGroup').css('display', 'inline');
        ajaxRequest('/get/data/classifyShowSynonyms', function(response) {
            var $xmlSynonyms = $(response).find('synonyms').children();
            var syId = $('#clSymbol').val();
            var selectItems = [];
            $xmlSynonyms.each(function(i, e) {
                if ($(e).attr('id') != syId) {
                    selectItems.push($('<option>').attr('value', 
                        $(e).attr('id')).text($(e).children('name').text()).get(0));
                }
            });
            $('#clSynonymsSelect').html(selectItems);
        });
    };
    api.classify.updateComments = function(response) {
        var $xmlComments = $(response).find('comments').children();
        var comments = [];
        $xmlComments.each(function(i, e) {
        comments.push($('<li>').addClass(i % 2 == 0 ? 'rowEven' : 'rowOdd')
            .append($('<div>').addClass('left')
                .append($('<span>').addClass('overflowEllipsis')
                    .text($(e).find('user > name').text()+':'))
                .append($('<span>').text($(e).find('date').text())))
            .append($('<div>').addClass('right').html(
                tagSymbols($(e).find('content').text())))
            .append($('<div>').css('clear', 'both')).get(0));
        });
        var $clComments = $('#clComments');
        var $clNewComment = $('#clNewComment');
        $clComments.html(comments);
        $clComments.scrollTop(0);
        if ($clNewComment.val()) {
            $('#clCommentsToggle').css('display', 'block');
            api.classify.showComments();
        }
        $clNewComment.data('codeMirror').setValue('');
    };
    api.classify.updateInterface = function() {
        // is 'general term' or 'no functional requirement' category selected?
        if ($('#clCategory').val() === '1' || $('#clCategory').val() === '2') {
            $('#clClassificationLabel').hide();
            $('#clClassification').hide();
            $('#clIntentionFields').hide();
        } else {
            $('#clClassificationLabel').show();
            $('#clClassification').show();
            $('#clIntentionFields').show();
        }
        if ($('#clComments').children().length > 0) {
            $('#clCommentsToggle').css('display', 'block');
        } else {
            $('#clCommentsToggle').css('display', 'none');
        }
    };
    api.classify.updateSymbol = function() {
        ajaxRequest('/post/updateSymbol', function(response) {
            if ($(response).find('success').text() === 'true') {
                $('#clCancelGroup').css('display', 'none');
                $('#clSaveGroup').css('display', 'none');
                $('#clChangeGroup').css('display', 'inline');
                $('#clSynonymsSelect').val(-1);
                $('#clSynonymsSelect').css('display', 'none');
                var synonyms = $(response).find('synonymsGroup').children();
                $('#clLeaveGroup').css('display', synonyms.length > 0 ? 'inline' : 'none');
                $('#clLogUserName').text($(response).find('log > user > name').text());
                $('#clLogDate').text($(response).find('log > date').text());
                api.classify.updateComments(response);
            }
        }, $('#clForm').serialize());
    };
    
    api.document = {}
    api.document.classifySymbol = function(e) {
        var cm = $('#dcDocumentContent').data('codeMirror')
        if (cm != undefined) {
            var selectedText = new String(cm.getSelection())
            .replace(/^\s+|\s+$/g,'').substr(0,255);
            api.infoBubble.show(selectedText, e.pageX, e.pageY);
        }
    }
    api.document.update = function() {
        ajaxRequest('/post/updateDocument', null, $('#dcUpdateForm').serialize());
    };
    
    api.explore = {};
    api.explore.clearSearch = function() {
        $('#exSearch').val('');
        $('#exForm').submit();
    };
    api.explore.confirmRemoveSymbol = function(targetSymbol) {
        var id = $(targetSymbol).data('symbol.id');
        var symbolName = $(targetSymbol).data('symbol.name');
        var title = $('#messages .removeSymbolConfirmationTitle').html();
        var message = $('#messages .removeSymbolConfirmation').html();
        var deleteMsg = $('#messages .remove').html();
        var cancelMsg = $('#messages .cancel').html();
        $.confirm({
            'title'	: title,
            'message'	: $('<span>').addClass('itemName').
            text(symbolName)[0].outerHTML + message,
            'buttons'	: {
                'delete'	: {
                    'msg'   : deleteMsg,
                    'class'	: 'red',
                    'action': function(){
                        api.explore.removeSymbol(id);
                    }
                },
                'cancel'    : {
                    'msg'   : cancelMsg,
                    'class'	: 'blue',
                    'action': function(){}
                }
            }
        });
    }
    api.explore.removeSymbol = function(id) {
        ajaxRequest('/post/removeSymbol', function(response) {
            var redirect;
            if ($(response).find('success').text() === 'true') {
                redirect = '#!/explore';
            }
            return redirect;
        }, 'symbol=' + id);
    };
    api.explore.search = function(response){
        ajaxRequest('/get/data/exploreSymbols', function(response) {
            var $xmlSymbols = $(response).find('symbols').children();
            var $symbols = [];
            $xmlSymbols.each(function(i, e) {
                $symbols.push($('<li>').addClass(i % 2 == 0 ? 'rowEven' : 'rowOdd')
                    .append($('<a>').addClass('exSymbol').attr('href', '#!/classify?sy='+$(e).attr('id'))
                        .append($('<span>').addClass('overflowEllipsis exSyName').text($(e).children('name').text()))
                        .append($('<span>').addClass('overflowEllipsis').text($(e).find('category > name').text()))
                        .append($('<span>').addClass('overflowEllipsis').text($(e).find('classification > name').text()))
                        .append($('<span>').addClass('overflowEllipsis').text($(e).find('document > name').text()))
                        .append($('<span>').addClass('removeSymbol').data('symbol.id', $(e).attr('id'))
                            .data('symbol.name', $(e).children('name').text()).html('&#215;'))).get(0));
            });
            $('#exSymbolsList').html($symbols);
            $('#exSearchClear').css('visibility', $('#exSearch').val() ? 'visible' : 'hidden');
        }, $('#exForm').serialize());
    };
    
    api.infoBubble = {};
    api.infoBubble.show = function(text, left, top) {            
        if (text != '') {
            if(!infoBubble) {
                infoBubble = $('<a>').attr('id','infoBubble').
                append($('<span>').addClass('caption')).
                append($('<span>').addClass('arrow'));
                infoBubble.hide();
                infoBubble.on('click', function(e){
                    infoBubble.hide();
                });
                $('body').append(infoBubble);
            }
            infoBubble.attr('href', '#!/classify?dc=' + 
                $('#dcDocument').val() + '&na=' + text);
            infoBubble.find('.caption').text(text);
            infoBubble.css('top', top - infoBubble.outerHeight() - 35);
            infoBubble.css('left', left - infoBubble.outerWidth() / 2);
            infoBubble.show();
        }
    };
    api.infoBubble.hide = function() {
        if (infoBubble) infoBubble.hide();
    };
    
    api.manageDocuments = {};
    api.manageDocuments.create = function() {
        ajaxRequest('/post/createDocument', function(response) {
            var redirect;
            if ($(response).find('success').text() === 'true') {
                redirect = '#!/document';
            }
            return redirect;
        }, $('#mdCreateForm').serialize());
    };
    api.manageDocuments.load = function() {
        ajaxRequest('/post/loadDocument', function(response) {
            var redirect;
            if ($(response).find('success').text() === 'true') {
                redirect = '#!/document';
            }
            return redirect;
        }, $('#mdLoadForm').serialize());
    };
    
    api.manageProjectUsers = {};
    api.manageProjectUsers.addProjectUser = function() {
        ajaxRequest('/post/addProjectUser', function(response) {
            if ($(response).find('success').text() === 'true') {
                $('#mpuAddUserName').val('');
                api.manageProjectUsers.updateUserList(response);
            }
        }, $('#mpuAddUserForm').serialize());
    };
    api.manageProjectUsers.confirmRemoveUser = function(targetUser) {
        var userId = $(targetUser).data('user.id');
        $('#mpuRemoveUserId').val(userId);
        var userName = $(targetUser).data('user.name');
        var title = $('#messages .removeProjectUserConfirmationTitle').html();
        var message = $('#messages .removeProjectUserConfirmation').html();
        var deleteMsg = $('#messages .remove').html();
        var cancelMsg = $('#messages .cancel').html();
        $.confirm({
            'title'	: title,
            'message'	: $('<span>').addClass('itemName').
            text(userName)[0].outerHTML + message,
            'buttons'	: {
                'delete'	: {
                    'msg'   : deleteMsg,
                    'class'	: 'red',
                    'action': function(){
                        api.manageProjectUsers.removeProjectUser();
                    }
                },
                'cancel'    : {
                    'msg'   : cancelMsg,
                    'class'	: 'blue',
                    'action': function(){}
                }
            }
        });
    }
    api.manageProjectUsers.removeProjectUser = function() {
        ajaxRequest('/post/removeProjectUser', function(response) {
            if ($(response).find('success').text() === 'true') {
                api.manageProjectUsers.updateUserList(response);
            }
        }, $('#mpuRemoveUserForm').serialize());
    };
    api.manageProjectUsers.updateUserList = function(response) {
        var $xmlUsers = $(response).find('users').children();
        var users = [];
        $xmlUsers.each(function(i, e) {
        users.push($('<li>').addClass(i % 2 == 0 ? 'rowEven' : 'rowOdd')
            .append($('<span>').addClass('overflowEllipsis').text($(e).find('name').text()))
            .append($('<a>').addClass('removeUser').data('user.id', $(e).attr('id'))
                .data('user.name', $(e).find('name').text()).html('&#215;')).get(0));
        });
        $('#mpuUsersList').html(users);
    };
    
    api.manageProjects = {};
    api.manageProjects.createProject = function() {
        ajaxRequest('/post/createProject', function(response) {
            var redirect;
            if ($(response).find('success').text() === 'true') {
                var projectName = $(response).find('project').find('name').text();
                $('#ixProjectTitle').show();
                $('#ixProjectName').text(projectName);
                redirect = '#!/explore';
            }
            return redirect;
        }, $('#mpCreateForm').serialize());
    };
    api.manageProjects.leaveProject = function(projectId) {
        ajaxRequest('/post/leaveProject', function(response) {
            if ($(response).find('success').text() === 'true') {
                api.manageProjects.updateProjectsList(response);
            }
        }, 'project=' + projectId);
    };
    api.manageProjects.confirmLeaveProject = function(targetProject) {
        var projectId = $(targetProject).data('project.id');
        var projectName = $(targetProject).data('project.name');
        var title = $('#messages .leaveProjectConfirmationTitle').html();
        var message = $('#messages .leaveProjectConfirmation').html();
        var deleteMsg = $('#messages .leave').html();
        var cancelMsg = $('#messages .cancel').html();
        $.confirm({
            'title'	: title,
            'message'	: $('<span>').addClass('itemName').
            text(projectName)[0].outerHTML + message,
            'buttons'	: {
                'delete'	: {
                    'msg'   : deleteMsg,
                    'class'	: 'red',
                    'action': function(){
                        api.manageProjects.leaveProject(projectId);
                    }
                },
                'cancel'    : {
                    'msg'   : cancelMsg,
                    'class'	: 'blue',
                    'action': function(){}
                }
            }
        });
    };
    api.manageProjects.loadProject = function(targetProject) {
        ajaxRequest('/post/loadProject', function(response) {
            var redirect;
            if ($(response).find('success').text() === 'true') {
                var projectName = $(response).find('project').find('name').text();
                $('#ixProjectTitle').show();
                $('#ixProjectName').text(projectName);
                redirect = '#!/explore';
            }
            return redirect;
        }, 'project=' + $(targetProject).data('project.id'));
    };
    api.manageProjects.removeProject = function(projectId) {
      ajaxRequest('/post/removeProject', function(response) {
            if ($(response).find('success').text() === 'true') {
                api.manageProjects.updateProjectsList(response);
            }
        }, 'project=' + projectId);
    };
    api.manageProjects.confirmRemoveProject = function(targetProject) {
        var projectId = $(targetProject).data('project.id');
        var projectName = $(targetProject).data('project.name');
        var title = $('#messages .removeProjectConfirmationTitle').html();
        var message = $('#messages .removeProjectConfirmation').html();
        var deleteMsg = $('#messages .remove').html();
        var cancelMsg = $('#messages .cancel').html();
        $.confirm({
            'title'	: title,
            'message'	: $('<span>').addClass('itemName').
            text(projectName)[0].outerHTML + message,
            'buttons'	: {
                'delete'	: {
                    'msg'   : deleteMsg,
                    'class'	: 'red',
                    'action': function(){
                        api.manageProjects.removeProject(projectId);
                    }
                },
                'cancel'    : {
                    'msg'   : cancelMsg,
                    'class'	: 'blue',
                    'action': function(){}
                }
            }
        });
    };
    api.manageProjects.updateProjectsList = function(response) {
        var $xmlProjects = $(response).find('projects').children();
        var projects = [];
        var isOwner;
        var projectId;
        var projectName;
        var isSelected;
        var captionOwner = $(response).find('captions > owner').text();
        var captionLoad = $(response).find('captions > load').text();
        var captionEdit = $(response).find('captions > edit').text();
        var captionUsers = $(response).find('captions > users').text();
        var captionDescription = $(response).find('captions > description').text();
        $xmlProjects.each(function(i, e) {
            projectId = $(e).attr('id');
            projectName = $(e).children('name').text();
            isOwner = $(e).attr('isOwner') === 'true';
            isSelected = $(e).attr('isSelected') === 'true';
            projects.push($('<li>').addClass(isSelected ? 'rowSelected' : i % 2 == 0 ? 'rowEven' : 'rowOdd')
                .append($('<a>').addClass('clear').addClass(isOwner ? 'remove' : 'leave')
                    .data('project.id', projectId).data('project.name', projectName).html('&#215;'))
                .append($('<h2>').addClass('title overflowEllipsis').text(projectName))
                .append($('<h3>').addClass('title overflowEllipsis')
                    .append($('<label>').html(captionOwner + ':&nbsp;'))
                    .append($('<span>').text($(e).find('owner > name').text())))                    
                .append($('<p>').addClass('description')
                    .append($('<label>').html(captionDescription + ':&nbsp;'))
                    .append($('<span>').text($(e).find('description').text())))
                .append($('<div>').addClass('options')
                    .append($('<a>').addClass('button load').data('project.id', projectId).text(captionLoad))
                    .append(isOwner ? $('<a>').addClass('button edit').text(captionEdit) : null)
                    .append(isOwner ? $('<a>').addClass('button')
                        .attr('href', '#!/manageProjectUsers?pj=' + projectId).text(captionUsers) : null)
            ).get(0));
        });
        $('#mpProjectsList').html(projects);
    };
    
    api.scrollingText = {};
    api.scrollingText.scroll = function(container) {
        var $container = $(container);
        $container.css('text-overflow', 'clip');
        var $content = $container.find('span.overflowText');
        var offset = $container.width() - $content.width();
        if (offset < 0) {
            $content.animate({
                'margin-left': offset
            }, {
                duration: offset * -10, 
                easing: 'linear'
            });
        } 
    };
    api.scrollingText.reset = function(container) {
        var $containter = $(container);
        $containter.css('text-overflow', 'ellipsis');
        var $content = $containter.find('span.overflowText');
        var offset = $containter.width() - $content.width();
        if (offset < 0) {
            $content.clearQueue().stop();
            $content.css('margin-left', 0);
        }
    };
    
    api.signIn = function() {
        ajaxRequest('/post/signIn', function(response) {
            if ($(response).find('success').text() === 'true') {
                window.location.href = appContext + '/#!/manageProjects';
            }
        }, $('#siForm').serialize());
    };
    api.signOut = function() {
        ajaxRequest('/post/signOut', function(response) {
            if ($(response).find('success').text() === 'true') {
                window.location.href = appContext + '/signIn';
            }
        });
    };
    return api;
})(jQuery, CodeMirror);