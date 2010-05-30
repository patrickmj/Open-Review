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
     * Setting to pass use during dialog creation
     */

    commentViewSettings: {
        autoOpen: false,
        draggable: true,
        resizable: true,
        focus: this.commentViewDialogFocus,
        close: this.commentViewDialogClose
    },
		
	/**
	 * Opens a dialog for commenting on a paragraph
	 * @param {Object} event
	 */
	openCommentDialog: function(event) {
		//make a copy of the comment form?
		var commentForm = $('#open-review-comment-form');
		var paraId = event.target.parentNode.parentNode.id;
        var d = OpenReview.commentForm;
        d.empty();        
		var paraId = event.target.parentNode.parentNode.id;		
		$('#edit-open-review-para-id').attr('value', paraId);
		d.append(commentForm);
		d.dialog('option', 'title', "Comment on " + OpenReview.getParaSnippet(paraId));
		d.dialog('open');
		
	},
	/**
	 * Opens a dialog for viewing all the comments on a paragraph
	 * @param {Object} event
	 */
	openViewDialog: function(event) {
		var targetP = event.target.parentNode.parentNode;
		var paraId = targetP.id;
		var d = OpenReview.getCommentViewDialog(paraId);
		
		if (d) {
	        //clientWidth probably fails in, guess what?, IE!
	        var pos = [targetP.offsetLeft + targetP.clientWidth + 150 + OpenReview.commentViewDialogs.length * 30, targetP.offsetTop - 30];
	        var snippet = OpenReview.getParaSnippet(paraId);		
	        var comments = $(OpenReview.gatherCommentsForPara(paraId));
	        comments.each(function(index, el) {
	            d.append($(el).clone());
	        });
	        d.dialog('option', 'title', 'Comments on ' + snippet);
	        d.dialog('option', 'position', pos);
	        d.dialog('open');		
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
		return returnArray;
		
	},
	
	/**
	 * Return the dialog to view comments on a paragraph, or create one if needed
	 * @param string paraId
	 * @return jQuery dialoge
	 */
	getCommentViewDialog: function(paraId) {
		for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
			if(OpenReview.commentViewDialogs[i].data('paraId') == paraId) {
				return false;
			}
		}
		if(OpenReview.commentViewDialogs.length == 0) {
		  var d = $('#open-review-comments-dialog').dialog(OpenReview.commentViewSettings);	
		} else {
		  
		}
		var d = $('#open-review-comments-dialog').dialog(OpenReview.commentViewSettings);
		
        if(OpenReview.commentViewDialogs.length != 0) {
            d = d.clone();
			
        }
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
		return '"' + $('#' + paraId).text().substr(0, 10) + '. . ."';
	},
	
	/**
	 * Callback for when a dialog receives focus
	 * @param {Object} event
	 * @param {Object} ui
	 */
	commentViewDialogFocus: function(event, ui) {
        for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
            $(OpenReview.commentViewDialogs[i]).removeClass('open-review-active');
        }
		$(event.target).addClass('open-review-active');
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
        
        for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
            if($(OpenReview.commentViewDialogs[i]).data('paraId') == paraId) {
                OpenReview.commentViewDialogs.splice(i, 1);
            }
        }		
	}
}

 $(document).ready(function(){
    $('.open-review-para-comment').click(OpenReview.openCommentDialog);
    $('.open-review-para-view').click(OpenReview.openViewDialog);

    OpenReview.commentForm = $('#open-review-comment-form-dialog').dialog({
        autoOpen: false,
        draggable: true,
        resizable: true
    });
 });
