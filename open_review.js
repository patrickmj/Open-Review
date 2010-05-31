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
	 * Opens a dialog for commenting on a paragraph
	 * @param {Object} event
	 */
	openCommentDialog: function(event) {
        
        var paraId = event.target.parentNode.parentNode.id;
        var d = OpenReview.commentFormDialog;		
        var commentForm = $('#open-review-comment-form');
        var commentFormClone = commentForm.clone();		
		commentFormClone.append($('#edit-open-review-para-id').clone());
		$('#edit-open-review-para-id', commentFormClone).val(paraId);
		
        
        d.empty();        	
		d.append(commentFormClone);

		d.dialog('option', 'title', "Comment on " + OpenReview.getParaSnippet(paraId));
		
        
        if(typeof tinyMCE != 'undefined') {
			
			//this is pretty hacky. I think what's happening is that tinyMCE remembers
			//when execCommand etc has been called on each id, and refuses to re-call it
			//so, add a new id for each textarea that I have to create
			//TODO: see if I can still kill the old tas
			var clonesLength = $('.open-review-ta-clone').length;			
            var ta = document.createElement('textarea');
            ta.setAttribute('id', 'edit-comment-clone-' + clonesLength);
			ta.setAttribute('class', 'open-review-ta-clone');        
            ta.setAttribute('name', 'comment');
			
            $('.mceEditor', commentFormClone).replaceWith(ta);
            tinyMCE.execCommand('mceAddControl', false, 'edit-comment-clone-' + clonesLength);           
        
        }		
		d.dialog('open');
		commentForm.remove();
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
			d.empty();
	        //clientWidth probably fails in, guess what?, IE!
	        var pos = [targetP.offsetLeft + targetP.clientWidth / 3 + 150 + OpenReview.commentViewDialogs.length * 30, targetP.offsetTop - 30];
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
	 * @return jQuery dialog
	 */
	getCommentViewDialog: function(paraId) {
		for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
			if(OpenReview.commentViewDialogs[i].data('paraId') == paraId) {
		        $('.ui-dialog-title').removeClass('open-review-active');
				$('.ui-dialog-title', OpenReview.commentViewDialogs[i].parent()).addClass('open-review-active');
				OpenReview.commentViewDialogs[i].dialog('moveToTop');
				return false;
			}
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
	    var text = $('#' + paraId).text();
		var textArray = text.split(' ');
		textArray = textArray.slice(1, 4);
		
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
        $('#' + paraId).removeClass('open-review-active');
        for(var i = 0; i<OpenReview.commentViewDialogs.length; i++) {
            if($(OpenReview.commentViewDialogs[i]).data('paraId') == paraId) {
                OpenReview.commentViewDialogs.splice(i, 1);
            }
        }

	},
	
	commentDialogClose: function(event, ui) {
	
	}

    
     
}
OpenReview.commentViewSettings =    
    {
        autoOpen: false,
        draggable: true,
        resizable: true,
        focus: OpenReview.commentViewDialogFocus,
        close: OpenReview.commentViewDialogClose
    };

OpenReview.commentSettings =
    {
        autoOpen: false,
        draggable: true,
        resizable: true        
    };


 $(document).ready(function(){
    $('.open-review-para-comment').click(OpenReview.openCommentDialog);
    $('.open-review-para-view').click(OpenReview.openViewDialog);

    OpenReview.commentFormDialog = $('#open-review-comment-form-dialog').dialog(OpenReview.commentSettings);
 });
