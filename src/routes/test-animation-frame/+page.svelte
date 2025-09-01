<script lang="ts">
	import { createAnimationControl as createAnimationControl } from "$lib/engine/animation/animation-control";
	import { tweenAnimate } from "$lib/engine/animation/tweens";

    let element;

    let tAnimation = tweenAnimate({from: 0, to: 300, duration: 1000},
                                  (val) => element.style.left = val + "px" );
    
    
    function startAnimation() {
        tAnimation.start();        
    }

    $effect(() => {
        return startAnimation();
    });
</script>


<div bind:this={element}>
    Box
</div>

<style>
    div {
        width: 100px;
        height: 100px;
        background-color: red;
        position: absolute;
        left: 0px;
    }
</style>