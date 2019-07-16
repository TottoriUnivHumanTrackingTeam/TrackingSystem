<template>
    <div>
        <b-card title="ŽžŒn—ñŠÝ‘JˆÚ" style="width: 90%; " class="mb-2">
             <Whereabouts v-bind:info="data" :height="300" />
        </b-card>
    </div>
</template>

<script>
import Whereabouts from './Whereabouts.vue'

export default {
    name: 'whereabouts-card',
    components: {
        Whereabouts
    },
    props: ['info'],
    data () {
        return {
            data: null
        }
    },
    mounted () {
        if(this.info){
            this.data = this.info;
        }
    },
    watch: {
        info: function() {
            this.data = this.info;
    }
  }
}
</script>