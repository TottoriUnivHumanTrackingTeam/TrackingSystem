<template>
    <b-navbar toggleable="md" type="light" variant="light">
        <b-navbar-brand>UserDashBoard</b-navbar-brand>
        <b-navbar-nav>
            <b-nav-text>{{ name }}Ç≥ÇÒÇÕç°{{ where }}Ç…Ç¢Ç‹Ç∑&nbsp;&nbsp;</b-nav-text>
            <b-nav-text style="color: #FF0000;" v-if="alart"> {{ name }}Ç≥ÇÒÇ™óßÇøì¸ÇËã÷é~ãÊàÊÇ…êNì¸ÇµÇƒÇ¢Ç‹Ç∑ÅI </b-nav-text>
            <b-nav-text style="color: #FF0000;" v-else-if="timeOut"> {{ name }}Ç≥ÇÒÇå©é∏Ç¢Ç‹ÇµÇΩÅI </b-nav-text>
            <b-nav-text v-else>àŸèÌÇÕÇ†ÇËÇ‹ÇπÇÒ</b-nav-text>
        </b-navbar-nav>
    </b-navbar>
</template>

<script>
export default {
    name: 'navbar',
    props: ['info'],
    data () {
        return {
            timeOut: false,
            alart: false,
            where: null,
            name: null
        }
    },
    mounted () {
        if(this.info){
            const arraySize = this.info.Location.length-1
            this.where = this.info.Location[arraySize].map

            this.timeOut = this.info.timeOut
            this.alart = this.info.Alart
            this.name = this.info.trackerName
            this.where = this.info.Location[arraySize].map
        }
    },
    watch: {
        info: function() {
            const arraySize = this.info.Location.length-1
            this.where = this.info.Location[arraySize].map

            this.timeOut = this.info.timeOut
            this.alart = this.info.Alart
            this.name = this.info.trackerName
        }
    }
}
</script>