

DESCRIPTION

Open Review attempts to build on the example of the excellent CommentPress plugin for WordPress. It differs from CommentPress in that a primary design goal is to make it theme-agnostic. I aim for this module to be usable with any Drupal theme, though testing that perfectly is clearly problematic. Nevertheless, I anticipate that it should work with what you are running. Please contact me with details about fails, and we can probably hack it to work with your theme.

INSTALLATION

Install in the usual Drupal way: put the files in your sites/all/modules or appropriate site-specific directory. Go to admin/modules and check the box.


CONFIGURATION

Go to Admin->Manage Content->Content Types->(Your content type for Open Review). For the content types that should use Open Review, edit the "Comments" section to enable the module. There is little support/testing for threaded comments, and very little testing across themes.

KNOWN ISSUES
This module brings in it's own jQuery files because of UX troubles using the jQuery Upgrade and jQuery UI modules. This could cause conflicts with other modules that use jQuery.

TODO

Work with all the various WYSIWYG editors.
*** TinyMCE supported -- most current version
*** FCKEditor 
*** WYMediator
*** openWYSIWYG
*** markItUp
*** yUI Editor
*** jWYSIWYG
*** NiceEdit
*** Whizzywig

  
Test across browsers. (Bail on IE6?)
*** FF
*** IE8
*** IE7
*** Safari
*** Chrome
*** Opera

Research better form for bringing in jQuery within the module itself??
