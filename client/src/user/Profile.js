import React, {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Edit from '@material-ui/icons/Edit';
import Divider from '@material-ui/core/Divider';
import DeleteUser from './DeleteUser';
import auth from './../auth/auth-helper';
import {read} from './api-user.js';
import {Redirect, Link} from 'react-router-dom';
import ProfileTabs from './../user/ProfileTabs';
import FollowProfileButton from './../user/FollowProfileButton';

const useStyles = makeStyles((theme) => ({
  root: theme.mixins.gutters({
    maxWidth: 600,
    margin: 'auto',
    padding: theme.spacing(3),
    marginTop: theme.spacing(5),
  }),
  title: {
    marginTop: theme.spacing(3),
    color: theme.palette.protectedTitle,
  },
}));

export default function Profile({match}) {
  const classes = useStyles();
  const [values, setValues] = useState({
    user: {following: [], followers: []},
    redirectToSignin: false,
    following: false,
  });
  const [user, setUser] = useState({});
  const [redirectToSignin, setRedirectToSignin] = useState(false);
  const jwt = auth.isAuthenticated();

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    read(
      {
        userId: match.params.userId,
      },
      {t: jwt.token},
      signal
    ).then((data) => {
      if (data && data.error) {
        setRedirectToSignin(true);
      } else {
        let following = checkFollow(data);
        setValues({...values, user: data, following: following});
        setUser(data);
      }
    });

    return function cleanup() {
      abortController.abort();
    };
  }, [match.params.userId]);

  const checkFollow = (user) => {
    const match = user.followers.some((follower) => {
      return follower._id === jwt.user._id;
    });
    return match;
  };

  const clickFollowButton = (callApi) => {
    callApi(
      {
        userId: jwt.user._id,
      },
      {
        t: jwt.token,
      },
      values.user._id
    ).then((data) => {
      if (data.error) {
        setValues({...values, error: data.error});
      } else {
        setValues({...values, user: data, following: !values.following});
      }
    });
  };

  const photoUrl = user._id
    ? `http://localhost:3000/api/users/photo/${
        user._id
      }?${new Date().getTime()}`
    : 'http://localhost:3000/api/users/defaultphoto';

  if (redirectToSignin) {
    return <Redirect to="/signin" />;
  }
  return (
    <Paper className={classes.root} elevation={4}>
      <Typography variant="h6" className={classes.title}>
        Profile
      </Typography>
      <List dense>
        <ListItem>
          <ListItemAvatar>
            <Avatar src={photoUrl} />
          </ListItemAvatar>
          <ListItemText primary={user.name} secondary={user.email} />{' '}
          {auth.isAuthenticated().user &&
          auth.isAuthenticated().user._id === user._id ? (
            <ListItemSecondaryAction>
              <Link to={'/user/edit/' + user._id}>
                <IconButton aria-label="Edit" color="primary">
                  <Edit />
                </IconButton>
              </Link>
              <DeleteUser userId={user._id} />
            </ListItemSecondaryAction>
          ) : (
            <FollowProfileButton
              following={values.following}
              onButtonClick={clickFollowButton}
            />
          )}
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary={user.about}
            secondary={'Joined: ' + new Date(user.created).toDateString()}
          />
        </ListItem>
      </List>
      <ProfileTabs user={values.user} />
    </Paper>
  );
}
