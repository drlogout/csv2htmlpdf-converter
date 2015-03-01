<?php
/**
 * Append this to your functions.php file insie your Wordpress theme
 */


// show meta box in child pages from page with id 92
function catalogue_convert_add_meta_box() {

	global $post;

	$args = array(
		'child_of' => 92
	); 


	$catalogue_childs = get_pages($args);

	for ($i = 0; $i < count($catalogue_childs); $i++) {

		if ($post->ID == $catalogue_childs[$i]->ID) {

			add_meta_box(
				'convert-catalogue',
				__( 'Katalog konvertieren', 'catalogue_convert_textdomain' ),
				'catalogue_convert_meta_box_callback',
				'page'
			);

			break;
		}
		
	}



}
add_action( 'add_meta_boxes', 'catalogue_convert_add_meta_box' );

function catalogue_convert_meta_box_callback( $post ) {

	// Add an nonce field so we can check for it later.
	wp_nonce_field( 'catalogue_convert_meta_box', 'catalogue_convert_meta_box_nonce' );

	$html = get_post_meta( $post->ID, '_catalogue_html_value_key', true );
	$pdf = get_post_meta( $post->ID, '_catalogue_pdf_value_key', true );


		echo '<div class="clearfix">';

			echo '<div class="form-group">';
				echo '<span class="btn btn-default btn-file">';
					echo 'CSV-Datei auswählen<input id="catalogue-input" type="file" name="csvFile">';
				echo '</span>';
				echo '<label class="file-name">keine Datei ausgewählt</label>';
			echo '</div>';

			echo '<hr>';

			echo '<div class="html">';
				echo '<button id="catalogue-html" class="btn btn-default ladda-button" data-style="expand-left"><span class="ladda-label">HTML erstellen</span></button>';
				echo '<i class="fa fa-check-circle hidden"></i><span class="message"></span>';
			echo '</div>';
			echo '<div class="pdf">';	
				echo '<button id="catalogue-pdf" class="btn btn-default ladda-button" data-style="expand-left"><span class="ladda-label">PDF erstellen</span></button>';
				echo '<i class="fa fa-check-circle hidden"></i><span class="message"></span>';
			echo '</div>';	
		echo '</div>';

		echo '<textarea id="catalogue_html_field" name="catalogue_html_field" rows="5" cols="100">' . esc_attr( $html ) . '</textarea>';
		echo '<input type="text" id="catalogue_pdf_field" name="catalogue_pdf_field" value="' . esc_attr( $pdf ) . '">';



}


function myplugin_save_meta_box_data( $post_id ) {

	/*
	 * We need to verify this came from our screen and with proper authorization,
	 * because the save_post action can be triggered at other times.
	 */

	// Check if our nonce is set.
	if ( ! isset( $_POST['catalogue_convert_meta_box_nonce'] ) ) {
		return;
	}

	// Verify that the nonce is valid.
	if ( ! wp_verify_nonce( $_POST['catalogue_convert_meta_box_nonce'], 'catalogue_convert_meta_box' ) ) {
		return;
	}

	// If this is an autosave, our form has not been submitted, so we don't want to do anything.
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	// Check the user's permissions.
	if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {

		if ( ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}

	} else {

		if ( ! current_user_can( 'edit_post', $post_id ) ) {
			return;
		}
	}

	/* OK, it's safe for us to save the data now. */
	
	// Make sure that it is set.
	if ( ! isset( $_POST['catalogue_html_field'] ) ) {
		return;
	}
	// Make sure that it is set.
	if ( ! isset( $_POST['catalogue_pdf_field'] ) ) {
		return;
	}

	// Sanitize user HTML.

	$allowed_html_tags = array(
		'table' => array(
			'class' => array()
		),
		'thead' => array(
			'class' => array()	
		),
		'th' => array(
			'class' => array()
		),
		'tbody' => array(
			'class' => array()
		),
		'tr' => array(
			'class' => array()
		),
		'td' => array(
			'class' => array()
		),
		'span' => array(
			'class' => array()
		),
		'p' => array(
			'class' => array()
		)
	);


	$sanitized_html = wp_kses( $_POST['catalogue_html_field'], $allowed_html_tags );

	// Update the meta field in the database.
	update_post_meta( $post_id, '_catalogue_html_value_key', $sanitized_html );
	update_post_meta( $post_id, '_catalogue_pdf_value_key', $_POST['catalogue_pdf_field'] );


}
add_action( 'save_post', 'myplugin_save_meta_box_data' );

add_action( 'admin_init', 'load_admin_style' );

function load_admin_style() {
	wp_enqueue_style( 'fa-css', '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css', false, '1.0.0' );
	wp_enqueue_style( 'ladda-css', get_template_directory_uri() . '/css/ladda-themeless.min.css', false, '1.0.0' );
	wp_enqueue_style( 'admin-css', get_template_directory_uri() . '/css/admin.css', array('ladda-css', 'fa-css'), '1.0.0' );
	wp_enqueue_script( 'admin-js', get_template_directory_uri() . '/js/admin.js', array('ladda-js'), '1.0.0', true );
	wp_enqueue_script( 'ladda-js', get_template_directory_uri() . '/js/ladda.min.js', array('spin-js'), '1.0.0', true );
	wp_enqueue_script( 'spin-js', get_template_directory_uri() . '/js/spin.min.js', array(), '1.0.0', true );
}