import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Html5Entities } from 'html-entities';
import Typography from '@material-ui/core/Typography';


// displays each individual card on the table
const useStyles = makeStyles({
    cardSmall: {
        border: ".2em solid black",
        borderRadius: "10%",
        height: "80px",
        width: "56px", /*70% of height*/
        marginRight: "5px",
        float: "left",
        backgroundColor: "white"
       },
      
    cardText: {
        margin: "0",
        marginTop: "15%",
        textAlign: "center",
        fontSize: "1.5em",
        fontWeight: "bold",
        padding: "0"
      },
      
    cardImg: {
        textAlign: "center",
        margin: "0",
        fontSize: "2em"
      },
      
      red: {
        color: "red",
      },
      
      black: {
        color: "black"
      }
      
  })

  const HiddenCard = ({name, chips}) => {
      console.log("hidden");
    const htmlEntities = new Html5Entities();
    const classes = useStyles();

    return (
    <div>
      <Typography variant="h6" gutterBottom>
          {name} : {chips} chips
      </Typography>
    <div className={classes.cardSmall}>
    <p className={[classes.cardText, classes.black]}>?</p>
    <p className={[classes.cardImg, classes.black]}></p>
  </div>
  <div className={classes.cardSmall}>
    <p className={[classes.cardText, classes.black]}>?</p>
    <p className={[classes.cardImg, classes.black]}></p>
  </div>
  </div>
    )
}
export default HiddenCard;