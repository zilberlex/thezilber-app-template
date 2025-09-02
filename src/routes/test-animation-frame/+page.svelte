<script lang="ts">
	import { tweenValue } from "$lib/engine/animation/tweens";

    let element: HTMLElement;

    let tAnimation = tweenValue((val) => element.style.left = val + "px",
                                { from: 0, to: 0, duration: 1000} );
    
    
    function startAnimation() {
        tAnimation.start({from: 0, to: 300 });        
    }

    $effect(() => {
        return startAnimation();
    });
</script>


<div class="container ly-full-screen">
    <div class="box-container box">
        <div class="moving-box" bind:this={element}>
            Box
        </div>
    </div>
    
    <div>
        <button class="box" onclick={() => tAnimation.start()}>
            repeat
        </button>
    </div>
</div>

<style lang="scss">
    // @use '$lib/ui/style/theme.stylish-terminal.scss' as *;

    :root {
        --moving-box-width: 100px;
    }
    
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 300px;
    }

    .box-container {        
        box-sizing: content-box;
        padding: 0;

        width: calc(var(--moving-box-width) + 300px);
        height: calc(var(--moving-box-width));

        position: relative;
    }

    .moving-box {
        width: var(--moving-box-width);
        height: var(--moving-box-width);
        background-color: red;
        position: absolute;
        left: 0px;
        top: 0;
    }
</style>