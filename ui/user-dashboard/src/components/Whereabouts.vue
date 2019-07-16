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
      const arraySize = this.info.Location.length-1;
      const limitTime = this.info.Location[arraySize].locatedTime - 3600000;

      for(let i = arraySize; this.info.Location[i].locatedTime >= limitTime; i -- ){
        this.placeList.push(this.info.Location[i].map)
        this.timeList.push(moment(this.info.Location[i].locatedTime).format('YYYY/MM/DD HH:mm:ss'))
      }
      this.placeList.reverse()
      this.timeList.reverse()
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
                  labels: this.placeList.filter(function (x, i, self) { return self.indexOf(x) == i;})
              }],
              xAxes: [{
                  ticks: {
                      autoSkip: true,
                      maxTicksLimit: 10 //ílÇÃç≈ëÂï\é¶êî
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