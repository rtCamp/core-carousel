<?php
namespace Carousel_System_Interactivity_API\Inc;

use Carousel_System_Interactivity_API\Inc\Traits\Singleton;

class Plugin {
	use Singleton;

	protected function __construct() {
		$this->setup_hooks();
	}

	protected function setup_hooks() {
		add_action( 'init', [ $this, 'register_blocks' ] );
		add_filter( 'block_categories_all', [ $this, 'register_block_category' ] );
	}

	public function register_block_category( $categories ) {
		return array_merge(
			$categories,
			[
				[
					'slug'  => 'carousel-system',
					'title' => __( 'Carousel System', 'carousel-system-interactivity-api' ),
				],
			]
		);
	}

	public function register_blocks() {
		$blocks = [
			'carousel',
			'carousel/controls',
			'carousel/dots',
			'carousel/viewport',
			'carousel/slide',
		];

		foreach ( $blocks as $block ) {
			register_block_type( CAROUSEL_SYSTEM_BUILD_PATH . '/blocks/' . $block );
		}
	}
}
