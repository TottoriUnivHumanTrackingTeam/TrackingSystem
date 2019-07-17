<script>
import moment from 'moment'
import { Line } from 'vue-chartjs'
export default {
  name: 'Whereabouts',
  extends: Line,
  props: ['info'],
  data: () => {
    return {
      placeList:[],
      timeList: []
      }
  },
  mounted () {
    if(this.info){
      this.makeList()
      this.renderCharts()
    }
  },
  methods: {
    makeList: function(){
      for(let location of this.info.Location){
        this.placeList.push(String(location.map))
        this.timeList.push(moment(location.locatedTime).format('YYYY/MM/DD HH:mm:ss'))
      }
    },
    renderCharts: function(){
      this.renderChart({
        labels: this.timeList,
        datasets: [
          {
            label: 'Data One',
            borderColor: '#f87979',
            lineTension: 0,
            fill: false,
            data: this.placeList
         }
        ]
     },{
         legend: {
            display: false
         },
         responsive: true,
         scales: {
              yAxes: [{
                  type: 'category',
                  labels: ["3809", "3810", "Corridor1", "Corridor2", "Corridor3", "Corridor4", "Corridor5", "3802"].reverse()
              }],
              xAxes: [{
                  ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10 //値の最大表示数
                 }
              }]
         }
      })
    }
  },
  watch: {
    info: function() {
      this.makeList()
      this.renderCharts()
    }
  }
}
</script>