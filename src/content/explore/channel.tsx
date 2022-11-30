import React from 'react'
import { useSelector } from 'react-redux'

import PostList from 'components/PostList';
import { selectVisitedChannelId } from 'redux/slices/channel';
import { getLocalDB } from 'utils/db';
import { selectQueryPublicStep } from 'redux/slices/proc';

function Channel() {
  const channel_id = useSelector(selectVisitedChannelId)
  const [isLoading, setIsLoading] = React.useState(true)
  const [totalCount, setTotalCount] = React.useState(0)
  const [pageEndTime, setPageEndTime] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(true)
  const [posts, setPosts] = React.useState([]);
  const currentPostStep = useSelector(selectQueryPublicStep('post_data'))
  const LocalDB = getLocalDB()

  React.useEffect(()=>{
    LocalDB.get('query-public-step')
      .then(currentStep=>{
        if(!currentStep['step'])
          setIsLoading(false)
      })
      .catch(_=>setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(()=>{
    setPageEndTime(0)
  }, [channel_id])
  React.useEffect(()=>{
    if(currentPostStep) {
      setIsLoading(true)
    }
    if(currentPostStep && channel_id) {
      appendMoreData('first')
      LocalDB.find({
        selector: {
          table_type: 'post',
          channel_id
        }
      })
        .then(res=>{
          setTotalCount(res.docs.length)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPostStep, channel_id])

  const appendMoreData = (type) => {
    let limit = 10
    let created_at: object = pageEndTime? {$lt: pageEndTime}: {$gt: true}
    if(type === "first") {
      limit = pageEndTime? undefined: 10
      created_at = pageEndTime? {$gte: pageEndTime}: {$gt: true}
    }

    LocalDB.createIndex({
      index: {
        fields: ['created_at'],
      }
    })
      .then(_=>(
        LocalDB.find({
          selector: {
            table_type: 'post',
            channel_id,
            created_at
          },
          sort: [{'created_at': 'desc'}],
          limit: 10
        })
      ))
      .then(response => {
        setIsLoading(false)
        if(response.docs.length<limit)
          setHasMore(false)
        if(type === 'first')
          setPosts(response.docs)
        else
          setPosts([...posts, ...response.docs])
        const pageEndPost = response.docs[response.docs.length-1]
        if(pageEndPost)
          setPageEndTime(pageEndPost['created_at'])
      })
      .catch(err=>setIsLoading(false))
  }

  const postListProps = { 
    isLoading, 
    posts,
    appendMoreData, 
    hasMore: posts.length < totalCount || hasMore
  }
  return (
    <PostList {...postListProps}/>
  );
}

export default Channel;
