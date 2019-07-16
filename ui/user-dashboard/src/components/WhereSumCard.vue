<template>
    <div>
        <b-card title="所在分布" style="width: 90%; " class="mb-2">
             <WhereSum v-bind:info="data" :height="300" />
        </b-card>
    </div>
</template>

<script>
import WhereSum from './WhereSum.vue'

export default {
    name: 'where-sum-card',
    components: {
        WhereSum
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