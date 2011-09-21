// $Id$

/**
 * @file
 * Javascript for managing jQuery dialogs for viewing and writing comments 
 * 
 */
 
var OpenReview = {
	
	/**
	 * Array of open dialogs
	 */
	commentViewDialogs : [],

  /**
   * An offset used to keep new dialogs distinguishable when opened
   */
  offset: 0,
	
  /**
   * The editor that OpenReview detects
   */

  editor: '',

  /**
   * Array of the editors javascript objects to check for
   */

  wysiwygs: ['tinyMCE'], 
			
	/**
	 * Opens a dialog for commenting on a paragraph
	 * @param {Object} event
	 */
	openCommentDialog: function(event) {
		
		$('.ui-dialog-title').removeClass('open-review-active');
		$('.open-review-para').removeClass('open-review-active');

    if($(event.target).hasClass('open-review-view-dialog-comment')) {
		  var paraId = $(event.target).data('paraId');		
		} else if($(event.target).hasClass('open-review-para-comment')) {
		  var paraId = event.target.parentNode.parentNode.id;		  
		}
    
    var commentDialog = $('#open-review-comment-form-dialog').dialog(OpenReview.commentSettings);
		commentDialog.dialog('moveToTop');
		$('.ui-dialog-title', commentDialog.parent()).addClass('open-review-active');
		$('#' + paraId).addClass('open-review-active');
    		        
    commentDialog.empty();        	
    commentDialog.data('paraId', paraId);
		commentDialog.dialog('option', 'title', Drupal.t("Comments on ") + OpenReview.getParaSnippet(paraId));
		commentDialog.dialog('option', 'width', '550');
		commentDialog.dialog('open');

		OpenReview.appendCommentFormClone(paraId, commentDialog);
	},

  // Making the wysiwyg editors work properly with jQuery requires some shenanigans.
	// appendCommentFormClone, commentFormUninit, and commmentFormInit aim to 
	// handle that on an editor-by-editor basis.

	/**
	 * Uninitialize the editors if needed before the jQuery starts working
	 * @param string editorElId the id of the editor element to uninitialize 
	 */

	commentFormUninit: function(editorElId) {		
		switch(OpenReview.editor) {
			case 'tinyMCE':			
		    tinyMCE.execCommand('mceRemoveControl', false, 'edit-comment');
				tinyMCE.execCommand('mceRemoveControl', false,  editorElId);
      break;
		}
	},
	
	/**
	 * Reinitialize the editors after the jQuery has placed the elements in dialogs
	 * @param string editorElId
	 */
	
	commentFormInit: function(editorElId) {
    switch(OpenReview.editor) {
      case 'tinyMCE':
        tinyMCE.execCommand('mceAddControl', false, 'edit-comment');
				tinyMCE.execCommand('mceAddControl', false,  editorElId);
									
      break;
    }
	},
	/**
	 * Append a comment for to a dialoge, after doing work to make the process safe with editors
	 * @param string paraId id of the para being commented on
	 * @param {Object} d the jQuery dialog to append the comment form to
	 */
	appendCommentFormClone: function(paraId, d) {		
	  if(d.attr('id') == 'open-review-comment-form-dialog' ) {
			var mceId = 'edit-' + paraId + '-cForm'; 
		} else {
			var mceId = 'edit-' + paraId;
		}
    OpenReview.commentFormUninit(mceId);   
		
		var commentFormClone = $('#open-review-comment-form').clone();		
    commentFormClone.append($('#edit-open-review-para-id').clone());
		$('#edit-open-review-para-id', commentFormClone).val(paraId);
    $('textarea', commentFormClone).attr('id', mceId);
		
    d.append(commentFormClone);		
		$('textarea', commentFormClone).addClass('wtf');			
		OpenReview.commentFormInit(mceId);
		 		
	},
	
	/**
	 * Opens a dialog for viewing all the comments on a paragraph
	 * @param {Object} event
	 */
	openViewDialog: function(event) {
		

		if( $(event.target).hasClass('open-review-comment-open-on-para')) {
		  var id = $(event.target).parent().attr('id');
		  var paraId = id.replace('open-review-on-para-', '');
		  var targetP = event.target;
      var pos = [targetP.offsetLeft + targetP.clientWidth / 3 + 150 + OpenReview.commentViewDialogs.length * 30, targetP.clientTop - 30];		  
		} else if( $(event.target).hasClass('open-review-para-view')) {
		  var targetP = event.target.parentNode.parentNode;
		  var pos = [targetP.offsetLeft + targetP.clientWidth / 3 + 150 + OpenReview.commentViewDialogs.length * 30, targetP.offsetTop - 30];
		  var paraId = targetP.id;	
		}


		var d = OpenReview.getCommentViewDialog(paraId);
		d.empty();
	     
	  var snippet = OpenReview.getParaSnippet(paraId);		
	  
		var comments = $(OpenReview.gatherCommentsForPara(paraId));

	  comments.each(function(index, el) {
			var elClone = $(el).clone();
			var indentCount = 0
			while($(el).parent().hasClass('indented')) {
			  indentCount++;
			  el = $(el).parent();
			}
			var indent = 20 * indentCount + 'px';
	    $(elClone).css({marginLeft: indent}) ;				
	    d.append(elClone);
	  });

	  d.dialog('option', 'title', Drupal.t("Comments on ") + snippet);
	  d.dialog('option', 'position', pos);			
	  d.dialog('open');
	  if(OpenReview.commentsInPopup) {
      OpenReview.appendCommentFormClone(paraId, d);       
    } else {
      d.append(OpenReview.getViewDialogCommentLink(paraId));
    }

	},
	
	/**
	 * Gathers the comments that apply to a paragraph
	 * @param string paraId
	 * @return array Array of comment nodes
	 */
	gatherCommentsForPara: function(paraId) {
		var returnArray = new Array();
		
		var comments = $('.comment').each(function(index, el) {
			var orSpans = $('#open-review-on-para-' + paraId, el);
			
			if(orSpans.length != 0) {
				returnArray[returnArray.length] = el;
			}			
		});
		$.unique(returnArray);
		return returnArray;		
	},
	
	
	getViewDialogCommentLink: function(paraId) {		
		var link = document.createElement('p');
		$(link).text('Add Comment');
		$(link).data('paraId', paraId);
		$(link).addClass('open-review-view-dialog-comment');		
		$(link).click(OpenReview.openCommentDialog);		
		return link;		
	},
	
	/**
	 * Return the dialog to view comments on a paragraph, or create one if needed
	 * @param string paraId
	 * @return jQuery dialog
	 */
	getCommentViewDialog: function(paraId) {


		$('.ui-dialog-title').removeClass('open-review-active');
		for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
			if(OpenReview.commentViewDialogs[i].data('paraId') == paraId) {		        
				$('.ui-dialog-title', OpenReview.commentViewDialogs[i].parent()).addClass('open-review-active');
				OpenReview.commentViewDialogs[i].dialog('moveToTop');
				var paraPos = $('#' + paraId).offset();								
				OpenReview.commentViewDialogs[i].dialog('option', 'position', [paraPos.left + 200 + OpenReview.getOffset(), 'top' + 2]);
				return OpenReview.commentViewDialogs[i];
			}
		}

	  var d = $('#open-review-comments-dialog').dialog(OpenReview.commentViewSettings).clone();

    d.dialog(OpenReview.commentViewSettings);
		d.data('paraId', paraId);
		OpenReview.commentViewDialogs.push(d);
		
	
		return d;
	},	
	
	/**
	 * Return a snippet from the paragraph
	 * @param string paraId
	 * @return string The first few characters of the paragraph
	 */
	getParaSnippet: function(paraId) {	
	  var text = $('#' + paraId).text();
		var textArray = text.substr(1).split(' ');
		textArray = textArray.slice(0, 4);		
		return '"' + textArray.join(' ') + '. . ."';
	},
	
	/**
	 * Callback for when a dialog receives focus
	 * @param {Object} event
	 * @param {Object} ui
	 */
	commentViewDialogFocus: function(event, ui) {
		  
		$('.ui-dialog-title').removeClass('open-review-active');
		$('.ui-dialog-title', event.target.parentNode).addClass('open-review-active');
		var paraId = $(event.target).data('paraId');
		$('.open-review-para').removeClass('open-review-active');
		$('#' + paraId).addClass('open-review-active');
    
	},
	
	/**
	 * Callback for when a dialog closes
	 * @param {Object} event
	 * @param {Object} ui
	 */
	commentViewDialogClose: function(event, ui) {		
	  var paraId = $(event.target).data('paraId');
		var mceId = 'edit-' + paraId;
		OpenReview.commentFormUninit(mceId);
      $('#' + paraId).removeClass('open-review-active');
      for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
        if($(OpenReview.commentViewDialogs[i]).data('paraId') == paraId) {
					 OpenReview.commentViewDialogs[i].empty();
           OpenReview.commentViewDialogs.splice(i, 1);
        }
      }
		OpenReview.commentFormInit(mceId);
	},
	
	commentDialogClose: function(event, ui) {
    var paraId = $(event.target).data('paraId');
    var mceId = 'edit-' + paraId;		
    OpenReview.commentFormUninit(mceId);
		$('#open-review-comment-form-dialog').empty();
		$('.open-review-active').removeClass('open-review-active');
		OpenReview.commentFormInit(mceId);
	},
	
	getOffset: function() {
		OpenReview.offset = OpenReview.offset + 15;
		if (OpenReview.offset > 180) {
			OpenReview.offset = 0;
		}
		return OpenReview.offset;
	} 
}

OpenReview.commentViewSettings = 
    {
      autoOpen: false,
      draggable: true,
      resizable: true,
			width: '550',
      focus: OpenReview.commentViewDialogFocus,
      close: OpenReview.commentViewDialogClose
    };

OpenReview.commentSettings =
    {
      autoOpen: false,
      draggable: true,
      resizable: true,
		  width: '550',
			focus: OpenReview.commentViewDialogFocus,
			close: OpenReview.commentDialogClose
    };


 $(document).ready(function(){
    $('.open-review-para-comment').click(OpenReview.openCommentDialog);
    $('.open-review-para-view').click(OpenReview.openViewDialog);
    $('.open-review-comment-open-on-para').click(OpenReview.openViewDialog);
		OpenReview.commentFormHTML = $('#open-review-comment-form').html();
		OpenReview.commentDialog = $('#open-review-comment-form-dialog').dialog(OpenReview.commentSettings);
		for (var editor in OpenReview.wysiwygs) {
			try {
				eval(editor);
				OpenReview.editor = editor;
			} catch (e) {
				
			}			
		}
 });
